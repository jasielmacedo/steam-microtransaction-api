import { NavigateFunction } from 'react-router-dom';

class NavigationService {
  private navigate: NavigateFunction | null = null;

  setNavigate(navigate: NavigateFunction) {
    this.navigate = navigate;
  }

  navigateTo(path: string, options?: { replace?: boolean }) {
    if (this.navigate) {
      this.navigate(path, options);
    }
  }

  replace(path: string) {
    this.navigateTo(path, { replace: true });
  }
}

export const navigationService = new NavigationService();