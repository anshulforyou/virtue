from django.urls import path
from .views import main, preview, test

urlpatterns = [
    path('', preview, name='preview'),
    path('main/<room>', main, name='main'),
    path('test', test, name='blurTest')
]