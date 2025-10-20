import { useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  Alert,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  useProduct,
  useCreateProduct,
  useUpdateProduct,
} from '../../hooks/useProducts';
import { CreateProductDto } from '../../types/product';

// 폼 검증 스키마
const productSchema = z.object({
  name: z.string().min(1, '상품명을 입력하세요'),
  description: z.string().min(1, '상품 설명을 입력하세요'),
  price: z.number().min(0, '가격은 0 이상이어야 합니다'),
  category: z.string().min(1, '카테고리를 입력하세요'),
  stock: z.number().int().min(0, '재고는 0 이상의 정수여야 합니다'),
  brand: z.string().optional(),
  isActive: z.boolean().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

/**
 * 상품 생성/수정 폼 페이지
 */
export const ProductFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== 'new' && !!id;

  // 데이터 조회 (수정 모드인 경우)
  const { data: product, isLoading: isLoadingProduct } = useProduct(id || '');

  // 뮤테이션
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  // 폼 관리
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: '',
      stock: 0,
      brand: '',
      isActive: true,
    },
  });

  // 상품 데이터 로드 시 폼에 채우기
  useEffect(() => {
    if (product && isEditMode) {
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        brand: product.brand || '',
        isActive: product.isActive ?? true,
      });
    }
  }, [product, isEditMode, reset]);

  // 폼 제출 핸들러
  const onSubmit = async (data: ProductFormData) => {
    try {
      const productData: CreateProductDto = {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        stock: data.stock,
        brand: data.brand || undefined,
        isActive: data.isActive,
      };

      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data: productData });
      } else {
        await createMutation.mutateAsync(productData);
      }

      navigate('/admin/products');
    } catch (error) {
      console.error('상품 저장 실패:', error);
    }
  };

  if (isLoadingProduct && isEditMode) {
    return <LoadingSpinner message="상품 정보를 불러오는 중..." />;
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const submitError = createMutation.error || updateMutation.error;

  return (
    <Box>
      {/* 헤더 */}
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        {isEditMode ? '상품 수정' : '상품 추가'}
      </Typography>

      {/* 에러 메시지 */}
      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          상품 저장에 실패했습니다. 다시 시도해주세요.
        </Alert>
      )}

      {/* 폼 */}
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* 상품명 */}
            <Grid item xs={12} md={6}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="상품명"
                    fullWidth
                    required
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>

            {/* 브랜드 */}
            <Grid item xs={12} md={6}>
              <Controller
                name="brand"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="브랜드"
                    fullWidth
                    error={!!errors.brand}
                    helperText={errors.brand?.message}
                  />
                )}
              />
            </Grid>

            {/* 카테고리 */}
            <Grid item xs={12} md={6}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="카테고리"
                    fullWidth
                    required
                    error={!!errors.category}
                    helperText={errors.category?.message}
                  />
                )}
              />
            </Grid>

            {/* 가격 */}
            <Grid item xs={12} md={3}>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="가격"
                    type="number"
                    fullWidth
                    required
                    error={!!errors.price}
                    helperText={errors.price?.message}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    InputProps={{
                      startAdornment: '₩',
                    }}
                  />
                )}
              />
            </Grid>

            {/* 재고 */}
            <Grid item xs={12} md={3}>
              <Controller
                name="stock"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="재고"
                    type="number"
                    fullWidth
                    required
                    error={!!errors.stock}
                    helperText={errors.stock?.message}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </Grid>

            {/* 상품 설명 */}
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="상품 설명"
                    fullWidth
                    required
                    multiline
                    rows={4}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>

            {/* 활성 상태 */}
            <Grid item xs={12}>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={field.onChange}
                        color="primary"
                      />
                    }
                    label="상품 활성화"
                  />
                )}
              />
            </Grid>

            {/* 버튼 */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => navigate('/admin/products')}
                  disabled={isSubmitting}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={isSubmitting || !isDirty}
                >
                  {isSubmitting ? '저장 중...' : '저장'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};
