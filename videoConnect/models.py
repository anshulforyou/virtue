from django.db import models
from django.db.models.base import Model

# Create your models here.

class users(models.Model):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=30, blank=True)

    def __str__(self):
        return self.email

class rooms(models.Model):
    roomName    = models.CharField(max_length=30)
    # author      = models.ForeignKey(users, on_delete=models.CASCADE)
    secret      = models.CharField(max_length=30)
    author      = models.ForeignKey(users, on_delete=models.CASCADE)
    isActive    = models.BooleanField(default=False)
    dateCreated = models.DateTimeField( auto_now_add = True)

    def __str__(self):
        return self.roomName

class userRoomRelationship(models.Model):
    room = models.ForeignKey(rooms, on_delete=models.CASCADE)
    user = models.ForeignKey(users, on_delete=models.CASCADE)
    inCall = models.BooleanField(default=False)
    # username = models.CharField(max_length=30)
    dateCreated = models.DateTimeField(auto_now_add = True)

    def __str__(self):
        return self.room.roomName + "-" + self.user.email
    
    class Meta:
        unique_together = ('room', 'user')
        ordering = ['-dateCreated']

class messageUserRelationship(models.Model):
    room = models.ForeignKey(rooms, on_delete=models.CASCADE)
    user = models.ForeignKey(users, on_delete=models.CASCADE)
    message = models.CharField(max_length=256)
    dateCreated = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.room.roomName + '-' +self.user.email