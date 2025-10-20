import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DataTable, Column } from '../../components/common/DataTable';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useProducts, useDeleteProduct } from '../../hooks/useProducts';
import { Product } from '../../types/product';
import { formatNumber } from '../../utils/chartHelpers';

/**
 * 상품 관리 목록 페이지
 */
export const ProductsListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // 상품 목록 조회
  const { data, isLoading, error } = useProducts({
    limit: rowsPerPage,
    offset: page * rowsPerPage,
  });

  // 상품 삭제
  const deleteMutation = useDeleteProduct();

  // 테이블 컬럼 정의
  const columns: Column<Product>[] = [
    {
      id: 'name',
      label: '상품명',
      minWidth: 200,
      format: (value, row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {value as string}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.brand || '-'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'category',
      label: '카테고리',
      minWidth: 120,
    },
    {
      id: 'price',
      label: '가격',
      minWidth: 100,
      align: 'right',
      format: (value) => `₩${formatNumber(value as number)}`,
    },
    {
      id: 'stock',
      label: '재고',
      minWidth: 80,
      align: 'right',
      format: (value) => formatNumber(value as number),
    },
    {
      id: 'isActive',
      label: '상태',
      minWidth: 100,
      format: (value) => (
        <Chip
          label={value ? '활성' : '비활성'}
          color={value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      id: 'actions',
      label: '작업',
      minWidth: 150,
      align: 'center',
      format: (_, row) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Tooltip title="상세보기">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/products/${row.id}`);
              }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="수정">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/products/${row.id}/edit`);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="삭제">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProductId(row.id);
                setDeleteDialogOpen(true);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // 삭제 확인 핸들러
  const handleDeleteConfirm = async () => {
    if (!selectedProductId) return;

    try {
      await deleteMutation.mutateAsync(selectedProductId);
      setDeleteDialogOpen(false);
      setSelectedProductId(null);
    } catch (error) {
      console.error('상품 삭제 실패:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="상품 목록을 불러오는 중..." />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          상품 목록을 불러오는데 실패했습니다.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* 헤더 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          상품 관리
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/products/new')}
        >
          상품 추가
        </Button>
      </Box>

      {/* 상품 테이블 */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        loading={isLoading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={data?.total || 0}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onRowClick={(row) => navigate(`/admin/products/${row.id}`)}
        emptyMessage="등록된 상품이 없습니다"
        rowKey="id"
      />

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="상품 삭제"
        message="정말로 이 상품을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다."
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedProductId(null);
        }}
        confirmText="삭제"
        cancelText="취소"
      />
    </Box>
  );
};
