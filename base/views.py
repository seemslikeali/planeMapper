from django.shortcuts import HttpResponseRedirect, redirect, render
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.contrib import messages
# messages is for errors and prompts
from .models import *


# Create your views here.
def home(request):
    return render(request, 'base/home.html')
def about(request):
    return render(request, 'base/about.html')
def contact(request):
    return render(request, "base/contact.html")
