from django.db import models
from django.db.models.base import Model

# Create your models here.

# class users(models.Model):
#     username = models.CharField(max_length=30, blank=True)

class rooms(models.Model):
    roomName    = models.CharField(max_length=30)
    # author      = models.ForeignKey(users, on_delete=models.CASCADE)
    author      = models.CharField(max_length=30)
    dateCreated = models.DateTimeField( auto_now_add = True)

    def __str__(self):
        return self.roomName

class userRoomRelationship(models.Model):
    room = models.ForeignKey(rooms, on_delete=models.CASCADE)
    # user = models.ForeignKey(users, on_delete=models.CASCADE)
    username = models.CharField(max_length=30)
    dateCreated = models.DateTimeField(auto_now_add = True)

    def __str__(self):
        return self.room.roomName + "-" + self.username
    
    class Meta:
        unique_together = ('room', 'username')
        ordering = ['-dateCreated']