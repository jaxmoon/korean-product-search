import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * React Error Boundary 컴포넌트
 * 하위 컴포넌트 트리에서 발생하는 에러를 캡처하고 폴백 UI 표시
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // 페이지 새로고침
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // 커스텀 폴백 UI가 제공된 경우
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 에러 UI
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            p: 3,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              maxWidth: 600,
              p: 4,
              textAlign: 'center',
            }}
          >
            <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />

            <Typography variant="h5" gutterBottom fontWeight={600}>
              문제가 발생했습니다
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              페이지를 표시하는 중 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
            </Typography>

            {this.state.error && (
              <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  에러 메시지:
                </Typography>
                <Typography variant="body2" component="pre" sx={{ fontSize: '12px', overflow: 'auto' }}>
                  {this.state.error.toString()}
                </Typography>
              </Alert>
            )}

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Component Stack:
                </Typography>
                <Typography variant="body2" component="pre" sx={{ fontSize: '11px', overflow: 'auto', maxHeight: 200 }}>
                  {this.state.errorInfo.componentStack}
                </Typography>
              </Alert>
            )}

            <Button
              variant="contained"
              color="primary"
              onClick={this.handleReset}
              size="large"
            >
              페이지 새로고침
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}
