
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type PageMode =
  | 'selection'
  | 'login'
  | 'register'
  | 'adminLogin'
  | 'dashboard'
  | 'adminDashboard';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(private cdr: ChangeDetectorRef) {}

  pageMode: PageMode = 'selection';

  // User login
  loginEmail = '';
  loginPassword = '';

  // User registration
  registerName = '';
  registerEmail = '';
  registerPassword = '';
  confirmPassword = '';

  // Admin login
  adminEmail = '';
  adminPassword = '';

  // Admin dashboard
  adminName = '';
  adminEmailAddress = '';
  adminActivePage = 'dashboard';
  adminMessage = '';
  adminMessageType: 'success' | 'error' = 'success';
  isLoadingAdmin = false;
  isSavingScheme = false;
  showSchemeForm = false;
  editingSchemeId: string | null = null;
  adminSchemes: any[] = [];
  schemeForm: any = this.emptySchemeForm();

  // Messages and loading
  message = '';
  messageType: 'success' | 'error' = 'error';
  isLoading = false;
  isLoadingSchemes = false;
  schemeMessage = '';

  // Dashboard
  userName = '';
  userEmail = '';
  userId = '';
  activePage = 'dashboard';

    // User profile
  profile: any = {
    name: '',
    email: '',
    age: null,
    gender: '',
    state: '',
    district: '',
    education: '',
    occupation: '',
    income: null,
    category: '',
    disability: false
  };

  isEditingProfile = false;
  isLoadingProfile = false;
  isSavingProfile = false;
  profileMessage = '';
  profileMessageType: 'success' | 'error' = 'success';

  schemes: any[] = [];
  savedSchemes: string[] = [];

  searchText = '';
  selectedCategory = 'All';

  readonly categories = [
    'All',
    'Education',
    'Employment',
    'Housing',
    'Healthcare',
    'Agriculture'
  ];

  // ================================
  // Page navigation
  // ================================

  selectUser(): void {
    this.pageMode = 'login';
    this.clearMessage();
  }

  selectAdmin(): void {
    this.pageMode = 'adminLogin';
    this.clearMessage();
  }

  showRegister(): void {
    this.pageMode = 'register';
    this.clearMessage();
  }

  showLogin(): void {
    this.pageMode = 'login';
    this.clearMessage();
  }

  goBack(): void {
    this.pageMode = 'selection';
    this.clearMessage();
  }

  // ================================
  // User login
  // ================================

  async login(): Promise<void> {
    if (this.isLoading) {
      return;
    }
    this.clearMessage();

    if (!this.loginEmail.trim() || !this.loginPassword) {
      this.showError('Please enter your email and password.');
      return;
    }

    this.isLoading = true;

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: this.loginEmail.trim(),
          password: this.loginPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        this.showError(data.message || 'Login failed.');
        return;
      }

      if (!data.user || !(data.user.id || data.user._id)) {
        this.showError('The server did not return valid user details.');
        return;
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem(
        'userId',
        String(data.user.id || data.user._id)
      );
      localStorage.setItem('userName', data.user.name || '');
      localStorage.setItem(
        'userEmail',
        data.user.email || this.loginEmail.trim()
      );
      localStorage.setItem('loggedIn', 'true');

      await this.openDashboard();
    } catch (error) {
      console.error('Login error:', error);
      this.showError('Cannot connect to the server.');
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  // ================================
  // User registration
  // ================================

  async register(): Promise<void> {
    this.clearMessage();

    if (
      !this.registerName.trim() ||
      !this.registerEmail.trim() ||
      !this.registerPassword ||
      !this.confirmPassword
    ) {
      this.showError('Please fill in all fields.');
      return;
    }

    if (this.registerPassword.length < 6) {
      this.showError('Password must be at least 6 characters long.');
      return;
    }

    if (this.registerPassword !== this.confirmPassword) {
      this.showError('Passwords do not match.');
      return;
    }

    this.isLoading = true;

    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: this.registerName.trim(),
          email: this.registerEmail.trim(),
          password: this.registerPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        this.showError(data.message || 'Registration failed.');
        return;
      }

      this.registerName = '';
      this.registerEmail = '';
      this.registerPassword = '';
      this.confirmPassword = '';

      this.pageMode = 'login';
      this.loginEmail = data.user?.email || '';

      this.showSuccess(
        data.message || 'Account created successfully! You can now log in.'
      );
    } catch (error) {
      console.error('Registration error:', error);
      this.showError('Cannot connect to the server.');
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  // ================================
  // Admin login
  // ================================


async adminLogin(): Promise<void> {
  if (this.isLoadingAdmin) return;

  this.clearMessage();

  if (!this.adminEmail.trim() || !this.adminPassword) {
    this.showError('Please enter your admin email and password.');
    return;
  }

  this.isLoadingAdmin = true;

  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: this.adminEmail.trim(),
        password: this.adminPassword
      })
    });

    const data = await response.json();

    if (!response.ok) {
      this.showError(data.message || 'Admin login failed.');
      return;
    }

    if (!data.token || !data.admin) {
      this.showError('The server did not return valid admin details.');
      return;
    }

    sessionStorage.setItem('adminToken', data.token);
    sessionStorage.setItem(
      'adminDetails',
      JSON.stringify(data.admin)
    );

    this.adminName = data.admin.name || 'Admin';
this.adminActivePage = 'dashboard';
this.adminMessage = '';
this.adminMessageType = 'success';
this.pageMode = 'adminDashboard';
void this.loadAdminSchemes();

  } catch (error) {
    console.error('Admin login error:', error);
    this.showError('Cannot connect to the server.');
  } finally {
  this.isLoadingAdmin = false;
  this.cdr.detectChanges();
}
}


  // ================================
  // Admin dashboard and scheme management
  // ================================

  private emptySchemeForm(): any {
    return {
      name: '',
      category: 'Education',
      benefit: '',
      deadline: '',
      description: '',
      url: '',
      eligibility: ''
    };
  }

  private adminHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem('adminToken') || ''}`
    };
  }

  async loadAdminSchemes(): Promise<void> {
    this.isLoadingAdmin = true;
    this.adminMessage = '';
    try {
      const response = await fetch('/api/schemes');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to load schemes.');
      this.adminSchemes = Array.isArray(data) ? data : [];
      this.schemes = this.adminSchemes;
    } catch (error) {
      this.adminMessage = error instanceof Error ? error.message : 'Unable to load schemes.';
      this.adminMessageType = 'error';
    } finally {
      this.isLoadingAdmin = false;
      this.cdr.detectChanges();
    }
  }

  changeAdminPage(page: string): void {
    this.adminActivePage = page;
    this.adminMessage = '';
    if (page === 'schemes') void this.loadAdminSchemes();
  }

  startAddScheme(): void {
    this.schemeForm = this.emptySchemeForm();
    this.editingSchemeId = null;
    this.showSchemeForm = true;
    this.adminMessage = '';
  }

  startEditScheme(scheme: any): void {
    this.schemeForm = {
      name: scheme.name || '',
      category: scheme.category || 'Education',
      benefit: scheme.benefit || '',
      deadline: scheme.deadline || '',
      description: scheme.description || '',
      url: scheme.url || '',
      eligibility: Array.isArray(scheme.eligibility)
        ? scheme.eligibility.join(', ')
        : (scheme.eligibility || '')
    };
    this.editingSchemeId = String(scheme._id || scheme.id);
    this.showSchemeForm = true;
    this.adminMessage = '';
  }

  cancelSchemeForm(): void {
    this.showSchemeForm = false;
    this.editingSchemeId = null;
    this.schemeForm = this.emptySchemeForm();
  }

  async saveScheme(): Promise<void> {
    if (this.isSavingScheme) return;
    if (!this.schemeForm.name.trim() || !this.schemeForm.benefit.trim() || !this.schemeForm.deadline) {
      this.adminMessage = 'Please fill in scheme name, benefit, and deadline.';
      this.adminMessageType = 'error';
      return;
    }

    this.isSavingScheme = true;
    this.adminMessage = '';
    const payload = {
      ...this.schemeForm,
      name: this.schemeForm.name.trim(),
      benefit: this.schemeForm.benefit.trim(),
      deadline: this.schemeForm.deadline.trim(),
      description: this.schemeForm.description.trim(),
      url: this.schemeForm.url.trim(),
      eligibility: this.schemeForm.eligibility
        ? this.schemeForm.eligibility.split(',').map((item: string) => item.trim()).filter(Boolean)
        : []
    };

    try {
      const isEditing = Boolean(this.editingSchemeId);
      const url = isEditing
        ? `/api/schemes/${encodeURIComponent(this.editingSchemeId as string)}`
        : '/api/schemes';
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: this.adminHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to save scheme.');

      this.adminMessage = data.message || (isEditing ? 'Scheme updated successfully.' : 'Scheme added successfully.');
      this.adminMessageType = 'success';
      this.cancelSchemeForm();
      await this.loadAdminSchemes();
    } catch (error) {
      this.adminMessage = error instanceof Error ? error.message : 'Unable to save scheme.';
      this.adminMessageType = 'error';
    } finally {
      this.isSavingScheme = false;
      this.cdr.detectChanges();
    }
  }

  async deleteScheme(scheme: any): Promise<void> {
    const id = String(scheme._id || scheme.id || '');
    if (!id || !confirm(`Delete "${scheme.name}"? This cannot be undone.`)) return;

    this.adminMessage = '';
    try {
      const response = await fetch(`/api/schemes/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: this.adminHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to delete scheme.');
      this.adminMessage = data.message || 'Scheme deleted successfully.';
      this.adminMessageType = 'success';
      await this.loadAdminSchemes();
    } catch (error) {
      this.adminMessage = error instanceof Error ? error.message : 'Unable to delete scheme.';
      this.adminMessageType = 'error';
    } finally {
      this.cdr.detectChanges();
    }
  }

  adminLogout(): void {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminDetails');
    this.adminEmail = '';
    this.adminPassword = '';
    this.adminName = '';
    this.adminEmailAddress = '';
    this.adminSchemes = [];
    this.showSchemeForm = false;
    this.pageMode = 'selection';
    this.clearMessage();
  }

  // ================================
  // User dashboard
  // ================================


async openDashboard(): Promise<void> {
  this.userName = localStorage.getItem('userName') || 'User';
  this.userEmail = localStorage.getItem('userEmail') || '';
  this.userId = localStorage.getItem('userId') || '';

  try {
    const storedSaved = JSON.parse(
      localStorage.getItem('savedSchemes') || '[]'
    );

    this.savedSchemes = Array.isArray(storedSaved)
      ? storedSaved.map((id: string | number) => String(id))
      : [];
  } catch {
    this.savedSchemes = [];
  }

  // Show the dashboard immediately after successful login
  this.pageMode = 'dashboard';
  this.activePage = 'dashboard';

  // Load schemes separately so they cannot prevent navigation
  void this.loadSchemes();
}


  async loadSchemes(): Promise<void> {
    this.isLoadingSchemes = true;
    this.schemeMessage = '';

    try {
      const response = await fetch('/api/schemes');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load schemes.');
      }

      this.schemes = Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Load schemes error:', error);
      this.schemeMessage = 'Unable to load schemes. Please try again.';
    } finally {
      this.isLoadingSchemes = false;
      this.cdr.detectChanges();
    }
  }

  // ================================
  // Scheme filtering
  // ================================

  get filteredSchemes(): any[] {
    const search = this.searchText.trim().toLowerCase();

    return this.schemes.filter(scheme => {
      const matchesSearch = [
        scheme.name,
        scheme.category,
        scheme.description,
        scheme.benefit
      ].some(value =>
        String(value || '').toLowerCase().includes(search)
      );

      const matchesCategory =
        this.selectedCategory === 'All' ||
        scheme.category === this.selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }

  get savedSchemeList(): any[] {
    return this.schemes.filter(scheme =>
      this.savedSchemes.includes(
        String(scheme._id ?? scheme.id)
      )
    );
  }

  get recommendedSchemes(): any[] {
    return this.schemes.slice(0, 3);
  }

  // ================================
  // Dashboard navigation
  // ================================

   changePage(page: string): void {
    this.activePage = page;
    this.schemeMessage = '';

    if (page === 'profile') {
      void this.loadProfile();
    }
  }

  // ================================
  // Save / unsave schemes
  // ================================

  toggleSave(scheme: any): void {
    const id = String(scheme._id ?? scheme.id);

    if (!id || id === 'undefined') {
      return;
    }

    if (this.savedSchemes.includes(id)) {
      this.savedSchemes = this.savedSchemes.filter(
        savedId => savedId !== id
      );
    } else {
      this.savedSchemes = [...this.savedSchemes, id];
    }

    localStorage.setItem(
      'savedSchemes',
      JSON.stringify(this.savedSchemes)
    );
  }

  isSaved(scheme: any): boolean {
    return this.savedSchemes.includes(
      String(scheme._id ?? scheme.id)
    );
  }
    // ================================
  // Load user profile
  // ================================

  async loadProfile(): Promise<void> {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      this.profileMessage = 'Please log in again to view your profile.';
      this.profileMessageType = 'error';
      return;
    }

    this.isLoadingProfile = true;
    this.profileMessage = '';

    try {
      const response = await fetch(
        `/api/users/profile/${encodeURIComponent(userId)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load profile.');
      }

      const user = data.user;

      this.profile = {
        name: user.name || '',
        email: user.email || '',
        age: user.age ?? null,
        gender: user.gender || '',
        state: user.state || '',
        district: user.district || '',
        education: user.education || '',
        occupation: user.occupation || '',
        income: user.income ?? null,
        category: user.category || '',
        disability: Boolean(user.disability)
      };

      this.userName = this.profile.name;
      this.userEmail = this.profile.email;

      localStorage.setItem('userName', this.userName);
      localStorage.setItem('userEmail', this.userEmail);
    } catch (error) {
      console.error('Load profile error:', error);
      this.profileMessage =
        error instanceof Error ? error.message : 'Unable to load profile.';
      this.profileMessageType = 'error';
    } finally {
      this.isLoadingProfile = false;
      this.cdr.detectChanges();
    }
  }

  // ================================
  // Edit and cancel profile
  // ================================

  editProfile(): void {
    this.profileMessage = '';
    this.isEditingProfile = true;
  }

  cancelProfileEdit(): void {
    this.isEditingProfile = false;
    this.profileMessage = '';
    void this.loadProfile();
  }

  // ================================
  // Save profile
  // ================================

  async saveProfile(): Promise<void> {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      this.profileMessage = 'Please log in again before saving.';
      this.profileMessageType = 'error';
      return;
    }

    if (!this.profile.name.trim()) {
      this.profileMessage = 'Please enter your name.';
      this.profileMessageType = 'error';
      return;
    }

    if (
      this.profile.age !== null &&
      this.profile.age !== '' &&
      (Number(this.profile.age) < 0 || Number(this.profile.age) > 120)
    ) {
      this.profileMessage = 'Please enter a valid age.';
      this.profileMessageType = 'error';
      return;
    }

    this.isSavingProfile = true;
    this.profileMessage = '';

    const profileData = {
      name: this.profile.name.trim(),
      age: this.profile.age === '' || this.profile.age === null
        ? null
        : Number(this.profile.age),
      gender: this.profile.gender,
      state: this.profile.state,
      district: this.profile.district.trim(),
      education: this.profile.education,
      occupation: this.profile.occupation,
      income: this.profile.income === '' || this.profile.income === null
        ? null
        : Number(this.profile.income),
      category: this.profile.category,
      disability: Boolean(this.profile.disability)
    };

    try {
      const response = await fetch(
        `/api/users/profile/${encodeURIComponent(userId)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(profileData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save profile.');
      }

      this.profile = {
        ...this.profile,
        ...(data.user || profileData)
      };

      this.userName = this.profile.name;
      this.userEmail = this.profile.email;

      localStorage.setItem('userName', this.userName);
      localStorage.setItem('userEmail', this.userEmail);

      this.isEditingProfile = false;
      this.profileMessage = 'Profile updated successfully!';
      this.profileMessageType = 'success';
    } catch (error) {
      console.error('Save profile error:', error);
      this.profileMessage =
        error instanceof Error ? error.message : 'Unable to save profile.';
      this.profileMessageType = 'error';
    } finally {
      this.isSavingProfile = false;
      this.cdr.detectChanges();
    }
  }

  // ================================
  // Logout
  // ================================

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('loggedIn');

    this.loginEmail = '';
    this.loginPassword = '';
    this.userName = '';
    this.userEmail = '';
    this.userId = '';
    this.schemes = [];
    this.savedSchemes = [];
    this.searchText = '';
    this.selectedCategory = 'All';
    this.activePage = 'dashboard';

    this.pageMode = 'selection';
    this.clearMessage();
  }

  // ================================
  // Messages
  // ================================

  private showSuccess(message: string): void {
    this.message = message;
    this.messageType = 'success';
  }

  private showError(message: string): void {
    this.message = message;
    this.messageType = 'error';
  }

  clearMessage(): void {
    this.message = '';
    this.messageType = 'error';
  }
}
