from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Report, Match, Profile


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = "__all__"
        read_only_fields = ["id", "reported_by", "created_at"]


class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = "__all__"
        read_only_fields = ["id", "created_at","approved_by", "approved_at"]


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
            username=email,   # login will use username=email
            email=email,
            password=password,
            first_name=name
        )

        Profile.objects.create(user=user, role=role)
        return user


