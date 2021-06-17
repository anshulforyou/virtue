from django.contrib import admin

from videoConnect.models import rooms, userRoomRelationship

# Register your models here.
admin.site.register(rooms)
admin.site.register(userRoomRelationship)