from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .serializers import RegisterSerializer, ReportSerializer
from .models import Report
from django.utils import timezone
from .models import Match
from .serializers import MatchSerializer



# * AUTH *
@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# * REPORTS *
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def reports(request):
    if request.method == "GET":
        qs = Report.objects.all().order_by("-created_at")

        status_filter = request.GET.get("status")
        category_filter = request.GET.get("category")
        location_filter = request.GET.get("location")
        search_query = request.GET.get("search")

        if status_filter:
            qs = qs.filter(status=status_filter)

        if category_filter:
            qs = qs.filter(category__icontains=category_filter)

        if location_filter:
            qs = qs.filter(location__icontains=location_filter)

        if search_query:
            qs = qs.filter(
                item_name__icontains=search_query
            ) | qs.filter(
                description__icontains=search_query
            ) | qs.filter(
                category__icontains=search_query
            ) | qs.filter(
                location__icontains=search_query
            )

        return Response(ReportSerializer(qs, many=True).data)

    if request.method == "POST":
        serializer = ReportSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(reported_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def report_detail(request, pk):
    try:
        report = Report.objects.get(pk=pk)
    except Report.DoesNotExist:
        return Response({"error": "Report not found"}, status=404)

    if request.method == "GET":
        return Response(ReportSerializer(report).data)

    if report.reported_by != request.user and not request.user.is_staff:
        return Response({"error": "Not allowed"}, status=403)

    if request.method == "PATCH":
        serializer = ReportSerializer(report, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    if request.method == "DELETE":
        report.delete()
        return Response(status=204)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def mark_returned(request, pk):
    try:
        report = Report.objects.get(pk=pk)
    except Report.DoesNotExist:
        return Response({"error": "Report not found"}, status=404)

    if report.reported_by != request.user and not request.user.is_staff:
        return Response({"error": "Not allowed"}, status=403)

    report.status = "RETURNED"
    report.save()

    return Response({"message": "Report marked as RETURNED"}, status=200)


# * MATCHES *
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def matches(request):
    # Admin can see all matches
    if request.method == "GET":
        if not request.user.is_staff:
            return Response({"error": "Admin only"}, status=403)

        qs = Match.objects.all().order_by("-created_at")
        return Response(MatchSerializer(qs, many=True).data)

    # AI member creates matches
    if request.method == "POST":
        serializer = MatchSerializer(data=request.data)
        if serializer.is_valid():
            match = serializer.save(status="PENDING")
            return Response(MatchSerializer(match).data, status=201)
        return Response(serializer.errors, status=400)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def matches_pending(request):
    if not request.user.is_staff:
        return Response({"error": "Admin only"}, status=403)

    qs = Match.objects.filter(status="PENDING").order_by("-created_at")
    return Response(MatchSerializer(qs, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def matches_approved(request):
    if not request.user.is_staff:
        return Response({"error": "Admin only"}, status=403)

    qs = Match.objects.filter(status="APPROVED").order_by("-created_at")
    return Response(MatchSerializer(qs, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def matches_rejected(request):
    if not request.user.is_staff:
        return Response({"error": "Admin only"}, status=403)

    qs = Match.objects.filter(status="REJECTED").order_by("-created_at")
    return Response(MatchSerializer(qs, many=True).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def approve_match(request, pk):
    if not request.user.is_staff:
        return Response({"error": "Admin only"}, status=403)

    try:
        match = Match.objects.get(pk=pk)
    except Match.DoesNotExist:
        return Response({"error": "Match not found"}, status=404)

    match.status = "APPROVED"
    match.approved_by = request.user
    match.approved_at = timezone.now()
    match.save()

    # auto-link: mark both reports as RETURNED + matched
    match.lost_report.status = "RETURNED"
    match.lost_report.is_matched = True
    match.lost_report.save()

    match.found_report.status = "RETURNED"
    match.found_report.is_matched = True
    match.found_report.save()

    return Response({"message": "Match approved"}, status=200)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def reject_match(request, pk):
    if not request.user.is_staff:
        return Response({"error": "Admin only"}, status=403)

    try:
        match = Match.objects.get(pk=pk)
    except Match.DoesNotExist:
        return Response({"error": "Match not found"}, status=404)

    match.status = "REJECTED"
    match.approved_by = request.user
    match.approved_at = timezone.now()
    match.save()

    return Response({"message": "Match rejected"}, status=200)

