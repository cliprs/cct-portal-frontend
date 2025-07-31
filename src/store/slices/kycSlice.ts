// src/store/slices/kycSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DocumentType = 'ID_FRONT' | 'ID_BACK' | 'PASSPORT' | 'DRIVER_LICENSE' | 'UTILITY_BILL' | 'BANK_STATEMENT';

export interface KycDocument {
  id: string;
  documentType: DocumentType;
  fileName: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  uploadedAt: string;
  updatedAt: string;
  fileSize?: number;
  storageType?: 'LOCAL' | 'S3';
  accessUrl?: string;
}

export interface KycRequirement {
  type: string;
  name: string;
  description: string;
  formats: string[];
  maxSize: string;
  required: boolean;
}

export interface KycSummary {
  totalDocuments: number;
  approvedDocuments: number;
  pendingDocuments: number;
  rejectedDocuments: number;
  kycStatus: 'NOT_UPLOADED' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  kycProgress: number;
  requiredDocuments: DocumentType[];
  missingDocuments: DocumentType[];
  canSubmitForReview: boolean;
}

interface KycState {
  documents: KycDocument[];
  requirements: {
    requiredDocuments: KycRequirement[];
    optionalDocuments: KycRequirement[];
    guidelines: string[];
    processingTime: string;
    supportedCountries: string[];
  } | null;
  summary: KycSummary | null;
  uploadProgress: number;
  loading: boolean;
  uploading: boolean;
  error: string | null;
}

const initialState: KycState = {
  documents: [
    // Mock data for development
    {
      id: 'doc1',
      documentType: 'ID_FRONT',
      fileName: 'passport_front.jpg',
      status: 'APPROVED',
      uploadedAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-16T14:20:00Z',
      fileSize: 2048576,
      storageType: 'LOCAL'
    },
    {
      id: 'doc2',
      documentType: 'UTILITY_BILL',
      fileName: 'utility_bill_jan.pdf',
      status: 'PENDING',
      uploadedAt: '2024-01-20T09:15:00Z',
      updatedAt: '2024-01-20T09:15:00Z',
      fileSize: 1024000,
      storageType: 'LOCAL'
    }
  ],
  requirements: {
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
  },
  summary: {
    totalDocuments: 2,
    approvedDocuments: 1,
    pendingDocuments: 1,
    rejectedDocuments: 0,
    kycStatus: 'PENDING',
    kycProgress: 67,
    requiredDocuments: ['ID_FRONT', 'UTILITY_BILL', 'BANK_STATEMENT'],
    missingDocuments: ['BANK_STATEMENT'],
    canSubmitForReview: false
  },
  uploadProgress: 0,
  loading: false,
  uploading: false,
  error: null,
};

const kycSlice = createSlice({
  name: 'kyc',
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    
    setUploading: (state, action: PayloadAction<boolean>) => {
      state.uploading = action.payload;
      if (action.payload) {
        state.error = null;
        state.uploadProgress = 0;
      }
    },

    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
      state.uploading = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Documents management
    setDocuments: (state, action: PayloadAction<KycDocument[]>) => {
      state.documents = action.payload;
      state.loading = false;
    },

    addDocument: (state, action: PayloadAction<KycDocument>) => {
      const existingIndex = state.documents.findIndex(
        doc => doc.documentType === action.payload.documentType
      );
      
      if (existingIndex !== -1) {
        // Replace existing document of same type
        state.documents[existingIndex] = action.payload;
      } else {
        // Add new document
        state.documents.push(action.payload);
      }
      
      state.uploading = false;
      state.uploadProgress = 100;
    },

    removeDocument: (state, action: PayloadAction<string>) => {
      state.documents = state.documents.filter(doc => doc.id !== action.payload);
    },

    updateDocumentStatus: (state, action: PayloadAction<{ id: string; status: KycDocument['status'] }>) => {
      const document = state.documents.find(doc => doc.id === action.payload.id);
      if (document) {
        document.status = action.payload.status;
        document.updatedAt = new Date().toISOString();
      }
    },

    // Requirements
    setRequirements: (state, action: PayloadAction<KycState['requirements']>) => {
      state.requirements = action.payload;
      state.loading = false;
    },

    // Summary
    setSummary: (state, action: PayloadAction<KycSummary>) => {
      state.summary = action.payload;
      state.loading = false;
    },

    // Actions
    uploadDocumentStart: (state) => {
      state.uploading = true;
      state.uploadProgress = 0;
      state.error = null;
    },

    uploadDocumentSuccess: (state, action: PayloadAction<KycDocument>) => {
      kycSlice.caseReducers.addDocument(state, action);
      // Update summary based on new document
      if (state.summary) {
        state.summary.totalDocuments = state.documents.length;
        state.summary.pendingDocuments = state.documents.filter(doc => doc.status === 'PENDING').length;
        state.summary.approvedDocuments = state.documents.filter(doc => doc.status === 'APPROVED').length;
        state.summary.rejectedDocuments = state.documents.filter(doc => doc.status === 'REJECTED').length;
        
        // Calculate progress (assuming 3 required documents)
        state.summary.kycProgress = Math.min(Math.round((state.documents.length / 3) * 100), 100);
        
        // Update missing documents - FIXED TYPE ISSUE
        const uploadedTypes = state.documents.map(doc => doc.documentType);
        state.summary.missingDocuments = state.summary.requiredDocuments.filter(
          type => !uploadedTypes.includes(type)
        );
        
        // Update can submit for review
        state.summary.canSubmitForReview = state.summary.missingDocuments.length === 0;
        
        // Update KYC status
        if (state.summary.canSubmitForReview) {
          state.summary.kycStatus = 'UNDER_REVIEW';
        } else {
          state.summary.kycStatus = 'PENDING';
        }
      }
    },

    uploadDocumentFailure: (state, action: PayloadAction<string>) => {
      state.uploading = false;
      state.uploadProgress = 0;
      state.error = action.payload;
    },

    deleteDocumentStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    deleteDocumentSuccess: (state, action: PayloadAction<string>) => {
      kycSlice.caseReducers.removeDocument(state, action);
      state.loading = false;
      
      // Update summary - FIXED TYPE ISSUE
      if (state.summary) {
        state.summary.totalDocuments = state.documents.length;
        state.summary.pendingDocuments = state.documents.filter(doc => doc.status === 'PENDING').length;
        state.summary.approvedDocuments = state.documents.filter(doc => doc.status === 'APPROVED').length;
        state.summary.rejectedDocuments = state.documents.filter(doc => doc.status === 'REJECTED').length;
        
        // Calculate progress
        state.summary.kycProgress = Math.min(Math.round((state.documents.length / 3) * 100), 100);
        
        // Update missing documents - FIXED TYPE ISSUE
        const uploadedTypes = state.documents.map(doc => doc.documentType);
        state.summary.missingDocuments = state.summary.requiredDocuments.filter(
          type => !uploadedTypes.includes(type)
        );
        
        // Update can submit for review
        state.summary.canSubmitForReview = state.summary.missingDocuments.length === 0;
        
        // Update KYC status
        if (state.documents.length === 0) {
          state.summary.kycStatus = 'NOT_UPLOADED';
        } else if (state.summary.canSubmitForReview) {
          state.summary.kycStatus = 'UNDER_REVIEW';
        } else {
          state.summary.kycStatus = 'PENDING';
        }
      }
    },

    deleteDocumentFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Verification
    startVerificationStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    startVerificationSuccess: (state) => {
      state.loading = false;
      if (state.summary) {
        state.summary.kycStatus = 'UNDER_REVIEW';
        state.summary.kycProgress = 100;
      }
      // Update all documents to UNDER_REVIEW
      state.documents.forEach(doc => {
        if (doc.status === 'PENDING') {
          doc.status = 'UNDER_REVIEW';
          doc.updatedAt = new Date().toISOString();
        }
      });
    },

    startVerificationFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Reset state
    resetKyc: (state) => {
      return initialState;
    }
  },
});

export const {
  setLoading,
  setUploading,
  setUploadProgress,
  setError,
  clearError,
  setDocuments,
  addDocument,
  removeDocument,
  updateDocumentStatus,
  setRequirements,
  setSummary,
  uploadDocumentStart,
  uploadDocumentSuccess,
  uploadDocumentFailure,
  deleteDocumentStart,
  deleteDocumentSuccess,
  deleteDocumentFailure,
  startVerificationStart,
  startVerificationSuccess,
  startVerificationFailure,
  resetKyc
} = kycSlice.actions;

export default kycSlice.reducer;