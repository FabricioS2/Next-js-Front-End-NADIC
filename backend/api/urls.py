from django.urls import path
from .views import (
    LoginView, InscricaoCreateView, ArtigoListCreateView,
    AdminInscricoesListView, AdminArtigosListView, AdminClearDataView
)

urlpatterns = [
    path('token/', LoginView.as_view(), name='token'),
    path('inscricoes/', InscricaoCreateView.as_view(), name='inscricao-create'),
    path('artigos/', ArtigoListCreateView.as_view(), name='artigos-list-create'),
    path('admin/inscricoes/', AdminInscricoesListView.as_view(), name='admin-inscricoes'),
    path('admin/artigos/', AdminArtigosListView.as_view(), name='admin-artigos'),
    path('admin/limpar-dados/', AdminClearDataView.as_view(), name='admin-limpar-dados'),
]