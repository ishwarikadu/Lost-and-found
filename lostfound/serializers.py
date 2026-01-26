from rest_framework import serializers
from .models import Report

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = "__all__"

 # api for registering/login users 

from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile

class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=["student", "staff"])

    def create(self, validated_data):
        name = validated_data["name"]
        email = validated_data["email"]
        password = validated_data["password"]
        role = validated_data["role"]

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=name
        )

        Profile.objects.create(user=user, role=role)
        return user
