import { useEffect, useState } from 'react';
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
  Chip,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  useSynonym,
  useCreateSynonym,
  useUpdateSynonym,
} from '../../hooks/useSynonyms';
import { CreateSynonymDto } from '../../types/synonym';

// 폼 검증 스키마
const synonymSchema = z.object({
  word: z.string().min(1, '기준 단어를 입력하세요'),
  synonymsText: z
    .string()
    .min(1, '유의어를 입력하세요 (쉼표로 구분)')
    .refine((text) => text.trim().length > 0, '유의어를 입력하세요'),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
});

type SynonymFormData = z.infer<typeof synonymSchema>;

/**
 * 유의어 생성/수정 폼 페이지
 */
export const SynonymFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== 'new' && !!id;
  const [synonymChips, setSynonymChips] = useState<string[]>([]);

  // 데이터 조회 (수정 모드인 경우)
  const { data: synonym, isLoading: isLoadingSynonym } = useSynonym(id || '');

  // 뮤테이션
  const createMutation = useCreateSynonym();
  const updateMutation = useUpdateSynonym();

  // 폼 관리
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<SynonymFormData>({
    resolver: zodResolver(synonymSchema),
    defaultValues: {
      word: '',
      synonymsText: '',
      category: '',
      isActive: true,
    },
  });

  const synonymsText = watch('synonymsText');

  // 유의어 데이터 로드 시 폼에 채우기
  useEffect(() => {
    if (synonym && isEditMode) {
      const synonymsStr = synonym.synonyms.join(', ');
      reset({
        word: synonym.word,
        synonymsText: synonymsStr,
        category: synonym.category || '',
        isActive: synonym.isActive ?? true,
      });
      setSynonymChips(synonym.synonyms);
    }
  }, [synonym, isEditMode, reset]);

  // 유의어 텍스트 변경 시 칩 업데이트
  useEffect(() => {
    if (synonymsText) {
      const chips = synonymsText
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      setSynonymChips(chips);
    } else {
      setSynonymChips([]);
    }
  }, [synonymsText]);

  // 칩 삭제 핸들러
  const handleDeleteChip = (chipToDelete: string) => {
    const newChips = synonymChips.filter((chip) => chip !== chipToDelete);
    setSynonymChips(newChips);
    setValue('synonymsText', newChips.join(', '), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // 폼 제출 핸들러
  const onSubmit = async (data: SynonymFormData) => {
    try {
      const synonyms = data.synonymsText
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      if (synonyms.length === 0) {
        return;
      }

      const synonymData: CreateSynonymDto = {
        word: data.word,
        synonyms,
        category: data.category || undefined,
        isActive: data.isActive,
      };

      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data: synonymData });
      } else {
        await createMutation.mutateAsync(synonymData);
      }

      navigate('/admin/synonyms');
    } catch (error) {
      console.error('유의어 저장 실패:', error);
    }
  };

  if (isLoadingSynonym && isEditMode) {
    return <LoadingSpinner message="유의어 정보를 불러오는 중..." />;
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const submitError = createMutation.error || updateMutation.error;

  return (
    <Box>
      {/* 헤더 */}
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        {isEditMode ? '유의어 수정' : '유의어 추가'}
      </Typography>

      {/* 에러 메시지 */}
      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          유의어 저장에 실패했습니다. 다시 시도해주세요.
        </Alert>
      )}

      {/* 폼 */}
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* 기준 단어 */}
            <Grid item xs={12} md={6}>
              <Controller
                name="word"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="기준 단어"
                    fullWidth
                    required
                    error={!!errors.word}
                    helperText={
                      errors.word?.message ||
                      '검색 시 이 단어로 치환될 대표 단어입니다'
                    }
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
                    error={!!errors.category}
                    helperText={
                      errors.category?.message ||
                      '유의어를 분류할 카테고리 (선택 사항)'
                    }
                  />
                )}
              />
            </Grid>

            {/* 유의어 입력 */}
            <Grid item xs={12}>
              <Controller
                name="synonymsText"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="유의어"
                    fullWidth
                    required
                    multiline
                    rows={3}
                    error={!!errors.synonymsText}
                    helperText={
                      errors.synonymsText?.message ||
                      '쉼표(,)로 구분하여 입력하세요. 예: 노트북, 랩탑, 넷북'
                    }
                  />
                )}
              />
            </Grid>

            {/* 유의어 미리보기 칩 */}
            {synonymChips.length > 0 && (
              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  유의어 미리보기 ({synonymChips.length}개)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {synonymChips.map((chip, index) => (
                    <Chip
                      key={index}
                      label={chip}
                      onDelete={() => handleDeleteChip(chip)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Grid>
            )}

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
                    label="유의어 활성화"
                  />
                )}
              />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                비활성화하면 검색에 적용되지 않습니다
              </Typography>
            </Grid>

            {/* 버튼 */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => navigate('/admin/synonyms')}
                  disabled={isSubmitting}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={isSubmitting || !isDirty || synonymChips.length === 0}
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
