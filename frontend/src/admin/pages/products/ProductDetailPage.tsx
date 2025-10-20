import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as BackIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useProduct, useDeleteProduct } from '../../hooks/useProducts';
import { formatNumber } from '../../utils/chartHelpers';

/**
 * 상품 상세 페이지
 */
export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: product, isLoading, error } = useProduct(id || '');
  const deleteMutation = useDeleteProduct();

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteMutation.mutateAsync(id);
      navigate('/admin/products');
    } catch (error) {
      console.error('상품 삭제 실패:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="상품 정보를 불러오는 중..." />;
  }

  if (error || !product) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">상품 정보를 불러오는데 실패했습니다.</Alert>
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate('/admin/products')}
          >
            목록
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            상품 상세
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            삭제
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/admin/products/${id}/edit`)}
          >
            수정
          </Button>
        </Box>
      </Box>

      {/* 상품 정보 */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* 기본 정보 */}
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              {product.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label={product.isActive ? '활성' : '비활성'}
                color={product.isActive ? 'success' : 'default'}
                size="small"
              />
              {product.brand && (
                <Chip label={product.brand} variant="outlined" size="small" />
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* 상세 정보 */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              카테고리
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {product.category}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              가격
            </Typography>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              ₩{formatNumber(product.price)}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              재고
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {formatNumber(product.stock)}개
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              등록일
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {new Date(product.createdAt).toLocaleString('ko-KR')}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              최종 수정일
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {new Date(product.updatedAt).toLocaleString('ko-KR')}
            </Typography>

            {product.rating !== undefined && (
              <>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  평점
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  ⭐ {product.rating.toFixed(1)} ({product.reviewCount || 0}개의 리뷰)
                </Typography>
              </>
            )}
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              상품 설명
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {product.description}
            </Typography>
          </Grid>

          {/* 태그 */}
          {product.tags && product.tags.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                태그
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {product.tags.map((tag, index) => (
                  <Chip key={index} label={tag} size="small" variant="outlined" />
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="상품 삭제"
        message="정말로 이 상품을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다."
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmText="삭제"
        cancelText="취소"
      />
    </Box>
  );
};
