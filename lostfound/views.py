from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Report
from .serializers import ReportSerializer

@api_view(["GET", "POST"])
def items(request):
    if request.method == "GET":
        qs = Report.objects.all().order_by("-created_at")
        return Response(ReportSerializer(qs, many=True).data)

    if request.method == "POST":
        serializer = ReportSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(posted_by_id=1)  # TEMP (until auth)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def item_detail(request, pk):
    try:
        item = Report.objects.get(pk=pk)
    except Report.DoesNotExist:
        return Response({"error": "Item not found"}, status=404)

    return Response(ReportSerializer(item).data)

# auth api registration 

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer

@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

