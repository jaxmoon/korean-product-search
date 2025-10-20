import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DataTable, Column } from '../../components/common/DataTable';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  useSynonyms,
  useDeleteSynonym,
  useSyncSynonyms,
} from '../../hooks/useSynonyms';
import { Synonym } from '../../types/synonym';

/**
 * 유의어 관리 목록 페이지
 */
export const SynonymsListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [selectedSynonymId, setSelectedSynonymId] = useState<string | null>(
    null
  );
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // 유의어 목록 조회
  const { data, isLoading, error } = useSynonyms();

  // 유의어 삭제
  const deleteMutation = useDeleteSynonym();

  // Elasticsearch 동기화
  const syncMutation = useSyncSynonyms();

  // 테이블 컬럼 정의
  const columns: Column<Synonym>[] = [
    {
      id: 'word',
      label: '기준 단어',
      minWidth: 150,
      format: (value) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {value as string}
        </Typography>
      ),
    },
    {
      id: 'synonyms',
      label: '유의어',
      minWidth: 250,
      format: (value) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {(value as string[]).map((synonym, index) => (
            <Chip key={index} label={synonym} size="small" variant="outlined" />
          ))}
        </Box>
      ),
    },
    {
      id: 'category',
      label: '카테고리',
      minWidth: 120,
      format: (value) => (value ? String(value) : '-'),
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
                navigate(`/admin/synonyms/${row.id}`);
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
                navigate(`/admin/synonyms/${row.id}/edit`);
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
                setSelectedSynonymId(row.id);
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
    if (!selectedSynonymId) return;

    try {
      await deleteMutation.mutateAsync(selectedSynonymId);
      setDeleteDialogOpen(false);
      setSelectedSynonymId(null);
      setSnackbar({
        open: true,
        message: '유의어가 삭제되었습니다.',
        severity: 'success',
      });
    } catch (error) {
      console.error('유의어 삭제 실패:', error);
      setSnackbar({
        open: true,
        message: '유의어 삭제에 실패했습니다.',
        severity: 'error',
      });
    }
  };

  // Elasticsearch 동기화 핸들러
  const handleSync = async () => {
    setSyncDialogOpen(false);
    try {
      const result = await syncMutation.mutateAsync();
      setSnackbar({
        open: true,
        message: result.message || 'Elasticsearch 동기화가 완료되었습니다.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Elasticsearch 동기화 실패:', error);
      setSnackbar({
        open: true,
        message: 'Elasticsearch 동기화에 실패했습니다.',
        severity: 'error',
      });
    }
  };

  // Snackbar 닫기
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (isLoading) {
    return <LoadingSpinner message="유의어 목록을 불러오는 중..." />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          유의어 목록을 불러오는데 실패했습니다.
        </Typography>
      </Box>
    );
  }

  // 페이지네이션을 위한 데이터 슬라이싱
  const paginatedData = data
    ? data.slice(page * rowsPerPage, (page + 1) * rowsPerPage)
    : [];

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
          유의어 관리
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<SyncIcon />}
            onClick={() => setSyncDialogOpen(true)}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending
              ? '동기화 중... (검색 일시 중단)'
              : 'Elasticsearch 동기화'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/synonyms/new')}
          >
            유의어 추가
          </Button>
        </Box>
      </Box>

      {/* 유의어 테이블 */}
      <DataTable
        columns={columns}
        data={paginatedData}
        loading={isLoading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={data?.length || 0}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onRowClick={(row) => navigate(`/admin/synonyms/${row.id}`)}
        emptyMessage="등록된 유의어가 없습니다"
        rowKey="id"
      />

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="유의어 삭제"
        message="정말로 이 유의어를 삭제하시겠습니까? 이 작업은 취소할 수 없습니다."
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedSynonymId(null);
        }}
        confirmText="삭제"
        cancelText="취소"
      />

      {/* 동기화 확인 다이얼로그 */}
      <ConfirmDialog
        open={syncDialogOpen}
        title="Elasticsearch 동기화"
        message="동기화 중에는 검색 서비스가 일시적으로 중단됩니다. (약 5-10초 소요) 계속하시겠습니까?"
        onConfirm={handleSync}
        onCancel={() => setSyncDialogOpen(false)}
        confirmText="동기화 시작"
        cancelText="취소"
      />

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
