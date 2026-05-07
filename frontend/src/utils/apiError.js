export function getErrorMessage(error, fallback = 'Có lỗi xảy ra. Vui lòng thử lại.') {
  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  if (error?.message && typeof error.message === 'string' && error.message.trim()) {
    return error.message;
  }

  if (error?.error && typeof error.error === 'string' && error.error.trim()) {
    return error.error;
  }

  return fallback;
}
