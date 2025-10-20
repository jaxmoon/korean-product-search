import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  SyncAlt as ReindexIcon,
} from '@mui/icons-material';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  useIndexStats,
  useRecreateIndex,
  useDeleteIndex,
  useReindex,
} from '../../hooks/useIndexes';

/**
 * Elasticsearch 인덱스 관리 페이지
 */
export const IndexesPage = () => {
  const [selectedIndex, setSelectedIndex] = useState('products');
  const [recreateDialogOpen, setRecreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reindexDialogOpen, setReindexDialogOpen] = useState(false);
  const [reindexForm, setReindexForm] = useState({
    sourceIndex: 'products',
    destIndex: 'products',
    synonymsText: '',
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // 인덱스 통계 조회
  const { data: stats, isLoading, error, refetch } = useIndexStats(selectedIndex);

  // 인덱스 재생성
  const recreateMutation = useRecreateIndex();

  // 인덱스 삭제
  const deleteMutation = useDeleteIndex();

  // 재인덱싱
  const reindexMutation = useReindex();

  // 재생성 확인 핸들러
  const handleRecreateConfirm = async () => {
    try {
      const result = await recreateMutation.mutateAsync(selectedIndex);
      setRecreateDialogOpen(false);
      setSnackbar({
        open: true,
        message: result.message || '인덱스가 재생성되었습니다.',
        severity: 'success',
      });
      refetch();
    } catch (error) {
      console.error('인덱스 재생성 실패:', error);
      setSnackbar({
        open: true,
        message: '인덱스 재생성에 실패했습니다.',
        severity: 'error',
      });
    }
  };

  // 삭제 확인 핸들러
  const handleDeleteConfirm = async () => {
    try {
      const result = await deleteMutation.mutateAsync(selectedIndex);
      setDeleteDialogOpen(false);
      setSnackbar({
        open: true,
        message: result.message || '인덱스가 삭제되었습니다.',
        severity: 'success',
      });
      refetch();
    } catch (error) {
      console.error('인덱스 삭제 실패:', error);
      setSnackbar({
        open: true,
        message: '인덱스 삭제에 실패했습니다.',
        severity: 'error',
      });
    }
  };

  // 재인덱싱 실행 핸들러
  const handleReindexSubmit = async () => {
    try {
      const synonyms = reindexForm.synonymsText
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const result = await reindexMutation.mutateAsync({
        sourceIndex: reindexForm.sourceIndex,
        destIndex: reindexForm.destIndex,
        synonyms: synonyms.length > 0 ? synonyms : undefined,
      });

      setReindexDialogOpen(false);
      setReindexForm({
        sourceIndex: 'products',
        destIndex: 'products',
        synonymsText: '',
      });
      setSnackbar({
        open: true,
        message:
          result.message ||
          `재인덱싱 완료 (전체: ${result.total}, 생성: ${result.created}, 수정: ${result.updated})`,
        severity: 'success',
      });
      refetch();
    } catch (error) {
      console.error('재인덱싱 실패:', error);
      setSnackbar({
        open: true,
        message: '재인덱싱에 실패했습니다.',
        severity: 'error',
      });
    }
  };

  // Snackbar 닫기
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 바이트를 읽기 쉬운 형식으로 변환
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading) {
    return <LoadingSpinner message="인덱스 통계를 불러오는 중..." />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          인덱스 통계를 불러오는데 실패했습니다.
        </Typography>
      </Box>
    );
  }

  const docCount = stats?.stats?.total?.docs?.count || 0;
  const deletedCount = stats?.stats?.total?.docs?.deleted || 0;
  const sizeInBytes = stats?.stats?.total?.store?.size_in_bytes || 0;

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
          Elasticsearch 인덱스 관리
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>인덱스 선택</InputLabel>
            <Select
              value={selectedIndex}
              label="인덱스 선택"
              onChange={(e) => setSelectedIndex(e.target.value)}
            >
              <MenuItem value="products">products</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
          >
            새로고침
          </Button>
        </Box>
      </Box>

      {/* 인덱스 통계 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                문서 수
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {docCount.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                삭제된 문서: {deletedCount.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                인덱스 크기
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {formatBytes(sizeInBytes)}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {sizeInBytes.toLocaleString()} bytes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                인덱스 상태
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip label="활성" color="success" />
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                인덱스 이름: {selectedIndex}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 작업 버튼 */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            인덱스 작업
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={() => setRecreateDialogOpen(true)}
            >
              인덱스 재생성
            </Button>
            <Button
              variant="outlined"
              color="info"
              startIcon={<ReindexIcon />}
              onClick={() => setReindexDialogOpen(true)}
            >
              재인덱싱
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              인덱스 삭제
            </Button>
          </Box>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            ⚠️ 인덱스 재생성 및 삭제는 되돌릴 수 없는 작업입니다. 신중하게
            진행해주세요.
          </Typography>
        </CardContent>
      </Card>

      {/* 재생성 확인 다이얼로그 */}
      <ConfirmDialog
        open={recreateDialogOpen}
        title="인덱스 재생성"
        message={`정말로 "${selectedIndex}" 인덱스를 재생성하시겠습니까? 기존 데이터는 유지되며 인덱스 구조만 재생성됩니다.`}
        onConfirm={handleRecreateConfirm}
        onCancel={() => setRecreateDialogOpen(false)}
        confirmText="재생성"
        cancelText="취소"
      />

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="인덱스 삭제"
        message={`정말로 "${selectedIndex}" 인덱스를 삭제하시겠습니까? 이 작업은 취소할 수 없으며 모든 데이터가 삭제됩니다.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmText="삭제"
        cancelText="취소"
      />

      {/* 재인덱싱 다이얼로그 */}
      <Dialog
        open={reindexDialogOpen}
        onClose={() => setReindexDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>재인덱싱</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>소스 인덱스</InputLabel>
              <Select
                value={reindexForm.sourceIndex}
                label="소스 인덱스"
                onChange={(e) =>
                  setReindexForm({ ...reindexForm, sourceIndex: e.target.value })
                }
              >
                <MenuItem value="products">products</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>대상 인덱스</InputLabel>
              <Select
                value={reindexForm.destIndex}
                label="대상 인덱스"
                onChange={(e) =>
                  setReindexForm({ ...reindexForm, destIndex: e.target.value })
                }
              >
                <MenuItem value="products">products</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="유의어 (선택사항)"
              placeholder="예: 노트북, 랩탑, laptop"
              value={reindexForm.synonymsText}
              onChange={(e) =>
                setReindexForm({ ...reindexForm, synonymsText: e.target.value })
              }
              helperText="쉼표로 구분하여 유의어를 입력하세요"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReindexDialogOpen(false)}>취소</Button>
          <Button
            onClick={handleReindexSubmit}
            variant="contained"
            disabled={reindexMutation.isPending}
          >
            {reindexMutation.isPending ? '재인덱싱 중...' : '재인덱싱 실행'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
