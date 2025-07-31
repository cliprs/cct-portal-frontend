// src/services/kycApi.ts
import apiService, { ApiResponse } from './api';
import { KycDocument, KycRequirement, KycSummary, DocumentType } from '../store/slices/kycSlice';

// KYC API Response Types
export interface KycUploadResponse {
  document: KycDocument;
  kycProgress: number;
  storageType: 'LOCAL' | 'S3';
}

export interface KycDocumentsResponse {
  documents: KycDocument[];
  summary: KycSummary;
}

export interface KycRequirementsResponse {
  requiredDocuments: KycRequirement[];
  optionalDocuments: KycRequirement[];
  guidelines: string[];
  processingTime: string;
  supportedCountries: string[];
}

export interface KycVerificationResponse {
  message: string;
  verificationId: string;
  estimatedProcessingTime: string;
}

class KycApiService {
  private readonly baseUrl = '/kyc';

  /**
   * Upload KYC document
   */
  async uploadDocument(
    file: File, 
    documentType: DocumentType,
    onUploadProgress?: (progress: number) => void
  ): Promise<KycUploadResponse> {
    try {
      const response = await apiService.uploadFile<KycUploadResponse>(
        `${this.baseUrl}/upload`,
        file,
        { documentType },
        (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onUploadProgress?.(progress);
          }
        }
      );

      if (!response.success) {
        throw new Error(response.message || 'Upload failed');
      }

      return response.data!;
    } catch (error: any) {
      console.error('KYC Upload Error:', error);
      throw new Error(error.message || 'Failed to upload document');
    }
  }

  /**
   * Get user's KYC documents
   */
  async getDocuments(): Promise<KycDocumentsResponse> {
    try {
      const response = await apiService.get<KycDocument[]>(`${this.baseUrl}/documents`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch documents');
      }

      const documents = response.data || [];
      
      // Calculate summary from documents
      const summary = this.calculateKycSummary(documents);

      return {
        documents,
        summary
      };
    } catch (error: any) {
      console.error('Get KYC Documents Error:', error);
      throw new Error(error.message || 'Failed to fetch KYC documents');
    }
  }

  /**
   * Delete KYC document
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      const response = await apiService.delete(`${this.baseUrl}/documents/${documentId}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete document');
      }
    } catch (error: any) {
      console.error('Delete KYC Document Error:', error);
      throw new Error(error.message || 'Failed to delete document');
    }
  }

  /**
   * Get KYC requirements
   */
  async getRequirements(): Promise<KycRequirementsResponse> {
    try {
      const response = await apiService.get<KycRequirementsResponse>(`${this.baseUrl}/requirements`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch requirements');
      }

      return response.data!;
    } catch (error: any) {
      console.error('Get KYC Requirements Error:', error);
      
      // Fallback to default requirements if API fails
      return this.getDefaultRequirements();
    }
  }

  /**
   * Start KYC verification process
   */
  async startVerification(): Promise<KycVerificationResponse> {
    try {
      const response = await apiService.post<KycVerificationResponse>(`${this.baseUrl}/verify`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to start verification');
      }

      return response.data!;
    } catch (error: any) {
      console.error('Start KYC Verification Error:', error);
      throw new Error(error.message || 'Failed to start verification process');
    }
  }

  /**
   * Get KYC status summary
   */
  async getKycSummary(): Promise<KycSummary> {
    try {
      // Get documents and calculate summary
      const { documents } = await this.getDocuments();
      return this.calculateKycSummary(documents);
    } catch (error: any) {
      console.error('Get KYC Summary Error:', error);
      
      // Return default summary on error
      return {
        totalDocuments: 0,
        approvedDocuments: 0,
        pendingDocuments: 0,
        rejectedDocuments: 0,
        kycStatus: 'NOT_UPLOADED',
        kycProgress: 0,
        requiredDocuments: ['ID_FRONT', 'UTILITY_BILL', 'BANK_STATEMENT'],
        missingDocuments: ['ID_FRONT', 'UTILITY_BILL', 'BANK_STATEMENT'],
        canSubmitForReview: false
      };
    }
  }

  /**
   * View/Download document
   */
  async viewDocument(documentId: string): Promise<void> {
    try {
      // This will open the document in a new tab or download it
      await apiService.downloadFile(`${this.baseUrl}/documents/${documentId}/view`);
    } catch (error: any) {
      console.error('View KYC Document Error:', error);
      throw new Error(error.message || 'Failed to view document');
    }
  }

  /**
   * Calculate KYC summary from documents
   */
  private calculateKycSummary(documents: KycDocument[]): KycSummary {
    const requiredDocuments: DocumentType[] = ['ID_FRONT', 'UTILITY_BILL', 'BANK_STATEMENT'];
    
    const totalDocuments = documents.length;
    const approvedDocuments = documents.filter(doc => doc.status === 'APPROVED').length;
    const pendingDocuments = documents.filter(doc => doc.status === 'PENDING').length;
    const rejectedDocuments = documents.filter(doc => doc.status === 'REJECTED').length;
    const underReviewDocuments = documents.filter(doc => doc.status === 'UNDER_REVIEW').length;

    // Calculate uploaded document types
    const uploadedTypes = documents.map(doc => doc.documentType);
    const missingDocuments = requiredDocuments.filter(type => !uploadedTypes.includes(type));

    // Calculate progress (required documents completion percentage)
    const uploadedRequiredDocs = requiredDocuments.filter(type => uploadedTypes.includes(type)).length;
    const kycProgress = Math.round((uploadedRequiredDocs / requiredDocuments.length) * 100);

    // Determine KYC status
    let kycStatus: KycSummary['kycStatus'];
    
    if (totalDocuments === 0) {
      kycStatus = 'NOT_UPLOADED';
    } else if (missingDocuments.length > 0) {
      kycStatus = 'PENDING';
    } else if (underReviewDocuments > 0 || (pendingDocuments > 0 && missingDocuments.length === 0)) {
      kycStatus = 'UNDER_REVIEW';
    } else if (approvedDocuments === requiredDocuments.length) {
      kycStatus = 'APPROVED';
    } else if (rejectedDocuments > 0) {
      kycStatus = 'REJECTED';
    } else {
      kycStatus = 'PENDING';
    }

    // Can submit for review if all required documents are uploaded
    const canSubmitForReview = missingDocuments.length === 0 && kycStatus !== 'UNDER_REVIEW' && kycStatus !== 'APPROVED';

    return {
      totalDocuments,
      approvedDocuments,
      pendingDocuments,
      rejectedDocuments,
      kycStatus,
      kycProgress,
      requiredDocuments,
      missingDocuments,
      canSubmitForReview
    };
  }

  /**
   * Get default requirements (fallback)
   */
  private getDefaultRequirements(): KycRequirementsResponse {
    return {
      requiredDocuments: [
        {
          type: 'ID_FRONT',
          name: 'Identity Document (Front)',
          description: 'Front side of your government-issued ID, passport, or driver\'s license',
          formats: ['JPEG', 'PNG', 'PDF'],
          maxSize: '10MB',
          required: true
        },
        {
          type: 'UTILITY_BILL',
          name: 'Proof of Address',
          description: 'Recent utility bill, bank statement, or government document showing your address',
          formats: ['JPEG', 'PNG', 'PDF'],
          maxSize: '10MB',
          required: true
        },
        {
          type: 'BANK_STATEMENT',
          name: 'Bank Statement',
          description: 'Recent bank statement (not older than 3 months)',
          formats: ['JPEG', 'PNG', 'PDF'],
          maxSize: '10MB',
          required: true
        }
      ],
      optionalDocuments: [
        {
          type: 'ID_BACK',
          name: 'Identity Document (Back)',
          description: 'Back side of your government-issued ID or driver\'s license',
          formats: ['JPEG', 'PNG', 'PDF'],
          maxSize: '10MB',
          required: false
        },
        {
          type: 'PASSPORT',
          name: 'Passport',
          description: 'Full passport document (all pages)',
          formats: ['JPEG', 'PNG', 'PDF'],
          maxSize: '10MB',
          required: false
        }
      ],
      guidelines: [
        'Documents must be clear and readable',
        'All four corners of the document must be visible',
        'Documents must not be older than 3 months',
        'Scanned copies and high-quality photos are acceptable',
        'Documents must be in color (black and white not accepted)',
        'Personal information must match your account details'
      ],
      processingTime: '1-3 business days',
      supportedCountries: ['US', 'UK', 'EU', 'TR', 'AE', 'All others']
    };
  }
}

// Create singleton instance
export const kycApiService = new KycApiService();

// Export default
export default kycApiService;   