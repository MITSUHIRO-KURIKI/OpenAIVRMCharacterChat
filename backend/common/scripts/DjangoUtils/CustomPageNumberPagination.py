# https://github.com/encode/django-rest-framework/blob/master/rest_framework/pagination.py
from django.core.paginator import InvalidPage
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import NotFound

# ページサイズとページ、降順フィールド(1つ)に対応
## ex. ****?size=10&page=2&ordering_desc_field_name=***
# 以下のようにしてフィルターにも対応
## from rest_framework import generics
## class ViewSet(generics.ListAPIView):
##     filterset_fields = ['field1','field2'...]
class CustomPageNumberPagination(PageNumberPagination):
    page_size     = 1
    max_page_size = 100 # 大量取得制限

    page_size_query_param    = 'size'
    page_query_param         = 'page'
    
    def __init__(self):
        self.ordering_desc_field_name = 'ordering_desc_field_name'

    # paginate_queryset オーバーライド
    def paginate_queryset(self, queryset, request, view=None):
        self.request = request
        page_size = self.get_page_size(request)
        if not page_size:
            return None
        ## 並び替え
        ordering_desc_field_name = request.query_params.get(self.ordering_desc_field_name)
        if ordering_desc_field_name:
            try:
                queryset = queryset.order_by('-'+str(ordering_desc_field_name))
            except:
                pass

        paginator   = self.django_paginator_class(queryset, page_size)
        page_number = self.get_page_number(request, paginator)

        try:
            self.page = paginator.page(page_number)
        except InvalidPage as exc:
            msg = self.invalid_page_message.format(
                page_number=page_number, message=str(exc)
            )
            raise NotFound(msg)

        if paginator.num_pages > 1 and self.template is not None:
            self.display_page_controls = True

        return list(self.page)