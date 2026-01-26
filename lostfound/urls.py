from django.urls import path
from .views import items, item_detail

urlpatterns = [
    path("api/items/", items),
    path("api/items/<int:pk>/", item_detail),
]
# auth api urls and path
from django.urls import path
from .views import register

urlpatterns = [
    path("api/register/", register),
]
