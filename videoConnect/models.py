from django.db import models
from django.db.models.base import Model

# Create your models here.

class Users(models.Model):
    username = models.CharField(max_length=30, blank=True, unique=True)