from django.contrib import admin

from videoConnect.models import rooms, userRoomRelationship, users, messageUserRelationship

# Register your models here.
admin.site.register(users)
admin.site.register(rooms)
admin.site.register(userRoomRelationship)
admin.site.register(messageUserRelationship)