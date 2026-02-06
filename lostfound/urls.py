from django.urls import path
from .views import ( register, report_matches, reports, report_detail, mark_returned,  matches,
    matches_pending,
    matches_approved,
    matches_rejected,
    approve_match,
    reject_match,
    unmatched_reports,
    ai_match)

urlpatterns = [
    path("api/register/", register),
    # reports
    path("api/reports/", reports),
    path("api/reports/<int:pk>/", report_detail),
    path("api/reports/<int:pk>/mark-returned/", mark_returned),
    # matches
    path("api/matches/", matches),
    path("api/matches/pending/", matches_pending),
    path("api/matches/approved/", matches_approved),
    path("api/matches/rejected/", matches_rejected),
    path("api/matches/<int:pk>/approve/", approve_match),
        path("api/matches/<int:pk>/reject/", reject_match),
        path("api/admin/reports/unmatched/", unmatched_reports),
        # Ai based matching endpoint 
        path("ai/match/", ai_match),
        path("reports/<int:pk>/matches/", report_matches),

    ]