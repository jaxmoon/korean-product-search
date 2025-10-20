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
import { useSynonym, useDeleteSynonym } from '../../hooks/useSynonyms';

/**
 * 유의어 상세 페이지
 */
export const SynonymDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: synonym, isLoading, error } = useSynonym(id || '');
  const deleteMutation = useDeleteSynonym();

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteMutation.mutateAsync(id);
      navigate('/admin/synonyms');
    } catch (error) {
      console.error('유의어 삭제 실패:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="유의어 정보를 불러오는 중..." />;
  }

  if (error || !synonym) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">유의어 정보를 불러오는데 실패했습니다.</Alert>
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
            onClick={() => navigate('/admin/synonyms')}
          >
            목록
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            유의어 상세
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
            onClick={() => navigate(`/admin/synonyms/${id}/edit`)}
          >
            수정
          </Button>
        </Box>
      </Box>

      {/* 유의어 정보 */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* 기본 정보 */}
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              {synonym.word}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label={synonym.isActive ? '활성' : '비활성'}
                color={synonym.isActive ? 'success' : 'default'}
                size="small"
              />
              {synonym.category && (
                <Chip
                  label={synonym.category}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* 유의어 목록 */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              유의어 ({synonym.synonyms.length}개)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {synonym.synonyms.map((word, index) => (
                <Chip
                  key={index}
                  label={word}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* 메타 정보 */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              카테고리
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {synonym.category || '-'}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              등록일
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {new Date(synonym.createdAt).toLocaleString('ko-KR')}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              상태
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {synonym.isActive ? '활성화됨' : '비활성화됨'}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              최종 수정일
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {new Date(synonym.updatedAt).toLocaleString('ko-KR')}
            </Typography>
          </Grid>

          {/* 설명 */}
          <Grid item xs={12}>
            <Divider sx={{ mb: 2 }} />
            <Alert severity="info">
              <Typography variant="body2">
                이 유의어는 검색 시 <strong>{synonym.word}</strong>로 치환되어
                검색됩니다.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </Paper>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="유의어 삭제"
        message="정말로 이 유의어를 삭제하시겠습니까? 이 작업은 취소할 수 없습니다."
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmText="삭제"
        cancelText="취소"
      />
    </Box>
  );
};
