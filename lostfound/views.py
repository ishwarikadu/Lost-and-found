from importlib import reload
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q

from cloudinary.uploader import upload, destroy
from urllib3 import request
from urllib3 import request
from .serializers import RegisterSerializer, ReportSerializer
from .models import Report
from django.utils import timezone
from .models import Match
from .serializers import MatchSerializer

from .utils import success_response, error_response




# * AUTH *
@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return success_response(
        "User registered successfully",
        None,
        status=status.HTTP_201_CREATED
)

    return error_response(
        "Validation failed",
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
)

# * REPORTS *
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def reports(request):

    if request.method == "GET":
        qs = Report.objects.all().order_by("-created_at")

        status_filter = request.GET.get("status")
        category_filter = request.GET.get("category")
        location_filter = request.GET.get("location")
        search_query = request.GET.get("search")

    if search_query:
        qs = qs.filter(
            Q(item_name__icontains=search_query) |
            Q(description__icontains=search_query) |
            Q(category__icontains=search_query) |
            Q(location__icontains=search_query)
        )

        # * pagination *
        try:
            page = int(request.GET.get("page", 1))
            limit = int(request.GET.get("limit", 10))
        except ValueError:
            return error_response(
                "page and limit must be integers",
                status=400
            )

        if page < 1 or limit < 1:
            return error_response(
                "page and limit must be positive numbers",
                status=400
            )

        start = (page - 1) * limit
        end = start + limit

        total_count = qs.count()
        qs = qs[start:end]

        return success_response(
            "Reports fetched successfully",
            {
                "total": total_count,
                "page": page,
                "limit": limit,
                "results": ReportSerializer(qs, many=True).data
            }
        )

    if request.method == "POST":
        serializer = ReportSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(reported_by=request.user)
            return success_response(
                "Report created successfully",
                serializer.data,
                status=201
            )

        return error_response(
            "Validation failed",
            serializer.errors,
            status=400
        )





@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def report_detail(request, pk):
    try:
        report = Report.objects.get(pk=pk)
    except Report.DoesNotExist:
        return error_response(
        "Report not found",
        status=404
    )


    if request.method == "GET":
     return success_response(
            "Report fetched successfully",
            ReportSerializer(report).data
        )
    if report.reported_by != request.user and not request.user.is_staff:
        return error_response(
    "Permission denied",
    status=403
)


    if request.method == "PATCH":
     image = request.FILES.get("image")

    # if a new image is uploaded
    if image:
        # delete old image from Cloudinary
        if report.image_public_id:
            destroy(report.image_public_id)

        # upload new image
        result = upload(image, folder="lost_found")
        report.image_url = result.get("secure_url")
        report.image_public_id = result.get("public_id")

    serializer = ReportSerializer(report, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return success_response(
            "Report updated successfully",
            serializer.data
        )

    return error_response(
        "Validation failed",
        serializer.errors,
        status=400
    )

    if request.method == "DELETE":
        # delete image from Cloudinary first
        if report.image_public_id:
            destroy(report.image_public_id)

    report.delete()
    return success_response(
        "Report deleted successfully",
        None,
        status=200
    )




@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def mark_returned(request, pk):
    try:
        report = Report.objects.get(pk=pk)
    except Report.DoesNotExist:
        return error_response(
    "Report not found",
    status=404
)



    if report.reported_by != request.user and not request.user.is_staff:
        return error_response(
    "Not allowed",
    status=403
)
    report.status = "RETURNED"
    report.save()

    return success_response(
    "Report marked as RETURNED",
    None,
    status=200
)

# * MATCHES *
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def matches(request):

    # * GET (admin only) *
    if request.method == "GET":
        if not request.user.is_staff:
            return error_response(
    "Admin access required",
    status=403
)


        qs = Match.objects.all().order_by("-created_at")
        return success_response(
    "Matches fetched successfully",
    MatchSerializer(qs, many=True).data,
    status=200
)



    # * POST AI creates match *
    serializer = MatchSerializer(data=request.data)

    if not serializer.is_valid():
        return error_response(
    "Validation failed",
    serializer.errors,
    status=400
)


    lost = serializer.validated_data["lost_report"]
    found = serializer.validated_data["found_report"]

    # sanity checks
    if lost.status != "LOST":
       return error_response(
    "lost_report must have status LOST",
    status=400
)


    if found.status != "FOUND":
        return error_response(
            "found_report must have status FOUND",
            status=400
        )

    match = serializer.save(status="PENDING")
    return success_response(
        "Match created successfully",
        MatchSerializer(match).data,
        status=201
    )


    return error_response(
        "Validation failed",
        serializer.errors,
        status=400
)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def matches_pending(request):
    if not request.user.is_staff:
       return error_response(
    "Admin access required",
    status=403
    )



    qs = Match.objects.filter(status="PENDING").order_by("-created_at")
    return success_response(
        "Matches fetched successfully",
        MatchSerializer(qs, many=True).data,
        status=200
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def matches_approved(request):
    if not request.user.is_staff:
                    return error_response(
    "Admin access required",
    status=403
)


    qs = Match.objects.filter(status="APPROVED").order_by("-created_at")
    return success_response(
        "Matches fetched successfully",
        MatchSerializer(qs, many=True).data,
        status=200
    )
    match.approved_by = request.user
    match.approved_at = timezone.now()



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def matches_rejected(request):
    if not request.user.is_staff:
      return error_response(
    "Admin access required",
    status=403
)

    qs = Match.objects.filter(status="REJECTED").order_by("-created_at")
    return success_response(
        "Matches fetched successfully",
        MatchSerializer(qs, many=True).data,
        status=200
    )
    match.approved_by = request.user
    match.approved_at = timezone.now()


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def approve_match(request, pk):
    if not request.user.is_staff:
        return error_response(
    "Admin access required",
    status=403
)

    try:
        match = Match.objects.get(pk=pk)
    except Match.DoesNotExist:
        return error_response(
            "Match not found",
            status=404
        )


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

    return success_response(
    "Match approved successfully",
    None,
    status=200
)


# * NOT APPROVE MATCH *

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def reject_match(request, pk):
    if not request.user.is_staff:
         return error_response(
    "Admin access required",
    status=403
)

    try:
        match = Match.objects.get(pk=pk)
    except Match.DoesNotExist:
        return error_response(
            "Match not found",
            status=404
        )


    match.status = "REJECTED"
    match.approved_by = request.user
    match.approved_at = timezone.now()
    match.save()

    return success_response(
    "Match Rejected",
    None,
    status=200
)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def unmatched_reports(request):
    if not request.user.is_staff:
        return error_response(
    "Admin access required",
    status=403
        )

    qs = Report.objects.filter(is_matched=False).order_by("-created_at")
    return success_response(
        "Unmatched reports fetched successfully",
        ReportSerializer(qs, many=True).data,
        status=200
    )