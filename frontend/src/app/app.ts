import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  showRegisterPage = false;

  // Login fields
  loginEmail = '';
  loginPassword = '';

  // Register fields
  registerName = '';
  registerEmail = '';
  registerPassword = '';
  confirmPassword = '';

  // Message
  message = '';
  messageType = '';

  // Loading state
  isRegistering = false;

  // ================================
  // Show Register Page
  // ================================

  showRegister(): void {
    this.showRegisterPage = true;
    this.clearMessage();
  }

  // ================================
  // Show Login Page
  // ================================

  showLogin(): void {
    this.showRegisterPage = false;
    this.clearMessage();
  }

  // ================================
  // Register User
  // ================================

  async register(): Promise<void> {

    this.clearMessage();

    // Check required fields
    if (
      !this.registerName ||
      !this.registerEmail ||
      !this.registerPassword ||
      !this.confirmPassword
    ) {
      this.message = 'Please fill in all fields.';
      this.messageType = 'error';
      return;
    }

    // Check password
    if (this.registerPassword !== this.confirmPassword) {
      this.message = 'Passwords do not match.';
      this.messageType = 'error';
      return;
    }

    this.isRegistering = true;

    try {

      const response = await fetch(
        'http://localhost:5000/api/users/register',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            name: this.registerName,
            email: this.registerEmail,
            password: this.registerPassword
          })
        }
      );

      const data = await response.json();

      // Backend returned an error
      if (!response.ok) {

        this.message = data.message || 'Registration failed.';
        this.messageType = 'error';

        return;
      }

      // Registration successful
      this.message = 'Account created successfully!';
      this.messageType = 'success';

      // Clear form
      this.registerName = '';
      this.registerEmail = '';
      this.registerPassword = '';
      this.confirmPassword = '';

    } catch (error) {

      console.error('Registration error:', error);

      this.message = 'Cannot connect to the server.';
      this.messageType = 'error';

    } finally {

      this.isRegistering = false;

    }
  }

  // ================================
  // Login
  // ================================

  login(): void {

    this.clearMessage();

    // Login backend will be connected next
    this.message = 'Login functionality will be connected next.';
    this.messageType = 'success';
  }

  // ================================
  // Clear Message
  // ================================

  clearMessage(): void {
    this.message = '';
    this.messageType = '';
  }
}