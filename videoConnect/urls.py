from django.urls import path
from .views import main, preview

urlpatterns = [
    path('', preview, name='preview'),
    path('main/<room>', main, name='main'),
]