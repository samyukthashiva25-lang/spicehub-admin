import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from './loading.service';
import { finalize } from 'rxjs/operators';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  
  // Turn on loading indicator
  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      // Turn off loading indicator when operation ends (Success or Fail)
      loadingService.hide();
    })
  );
};