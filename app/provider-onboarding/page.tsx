'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { tripKeyAlert } from '@/lib/alerts';
import { supabase } from '@/lib/supabase';

const PROVIDER_DOCUMENTS_BUCKET = 'provider-documents';

export default function ProviderOnboardingPage() {
  const [verificationDocument, setVerificationDocument] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [providerType, setProviderType] = useState('hotel');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkUserStatus = async () => {
      if (authLoading) return;

      if (!user) {
        router.replace('/login');
        return;
      }

      // Check if provider already uploaded documents
      const { data: profile } = await supabase
        .from('profiles')
        .select('verification_document_url, verification_status, provider_type, role')
        .eq('id', user.id)
        .single();

      if (profile?.verification_document_url) {
        setDocumentUrl(profile.verification_document_url);
      }

      if (profile?.verification_status) {
        setVerificationStatus(profile.verification_status);
      }

      if (profile?.role === 'provider' || profile?.verification_status === 'approved') {
        router.replace('/provider-dashboard');
        return;
      }

      // Set provider type from profile if exists
      if (profile?.provider_type) {
        setProviderType(profile.provider_type);
      }

      setCheckingStatus(false);
    };

    checkUserStatus();
  }, [user, authLoading, router]);

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image (JPG, PNG) or PDF file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setVerificationDocument(file);
      setError('');

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setDocumentPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setDocumentPreview(null);
      }
    }
  };

  const uploadVerificationDocument = async (userId: string, file: File): Promise<string | null> => {
    try {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}/${Date.now()}-verification.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(PROVIDER_DOCUMENTS_BUCKET)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Document upload error:', uploadError);
        return null;
      }

      const { data: publicData } = supabase.storage
        .from(PROVIDER_DOCUMENTS_BUCKET)
        .getPublicUrl(fileName);

      return publicData.publicUrl;
    } catch (err) {
      console.error('Document upload exception:', err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!verificationDocument) {
      setError('Please upload your ID card or business license for verification');
      return;
    }

    if (!user) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    tripKeyAlert.loading('Uploading verification document...');

    const documentUrl = await uploadVerificationDocument(user.id, verificationDocument);

    if (!documentUrl) {
      tripKeyAlert.close();
      const errorMsg = 'Failed to upload document. Please try again.';
      setError(errorMsg);
      setLoading(false);
      await tripKeyAlert.error('Upload Failed', errorMsg);
      return;
    }

    // Update profile with document URL, provider type, role, and set verification_status to pending
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        role: 'tourist',
        verification_document_url: documentUrl,
        verification_status: 'pending',
        provider_type: providerType,
      })
      .eq('id', user.id);

    if (updateError) {
      tripKeyAlert.close();
      console.error('Failed to update profile with document:', updateError);
      const errorMsg = 'Failed to save document information. Please try again.';
      setError(errorMsg);
      setLoading(false);
      await tripKeyAlert.error('Update Failed', errorMsg);
      return;
    }

    tripKeyAlert.close();
    await tripKeyAlert.success(
      'Document Uploaded!',
      'Your account is pending verification. An admin will review your documents shortly.'
    );
    setDocumentUrl(documentUrl);
    setVerificationStatus('pending');
    setLoading(false);
  };

  if (authLoading || checkingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center justify-center rounded-2xl bg-white shadow-2xl px-6 py-3 transform hover:scale-105 transition-transform duration-300">
              <div className="relative h-12 w-40">
                <Image
                  src="/tripkeylogobg.png"
                  alt="TripKey"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">Complete Your Profile</h1>
          <p className="text-blue-100 text-lg">Upload your verification document to get started</p>
        </div>

        {verificationStatus === 'pending' && documentUrl ? (
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification In Progress</h2>
              <p className="text-sm text-gray-600">
                Your document is under review. We will notify you once an admin approves your account.
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Status: Pending admin approval
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-gray-500 mb-2">Uploaded Document</p>
              <a
                href={documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-600 font-semibold hover:text-sky-700"
              >
                View your uploaded document
              </a>
            </div>
          </div>
        ) : (
          /* Document Upload Form */
          <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-6">
          {verificationStatus === 'rejected' && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Your previous document was rejected. Please upload a clear, valid ID proof to proceed.
            </div>
          )}
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-100 mb-4">
              <svg className="w-8 h-8 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verify Your Identity</h2>
            <p className="text-sm text-gray-600">
              Upload your ID card or business license for admin verification
            </p>
          </div>

          {/* Provider Type Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              What type of service do you provide?
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <select
                value={providerType}
                onChange={(e) => setProviderType(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
              >
                <option value="hotel">🏨 Hotel</option>
                <option value="transport">🚕 Transport/Taxi</option>
                <option value="attraction">🎡 Attraction/Activity</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Document Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Upload Document *
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleDocumentChange}
                className="hidden"
                id="verification-document"
              />
              <label
                htmlFor="verification-document"
                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                  verificationDocument
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-sky-400'
                }`}
              >
                {documentPreview ? (
                  <div className="relative w-full h-full p-4">
                    <img
                      src={documentPreview}
                      alt="Document preview"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                ) : verificationDocument ? (
                  <div className="flex flex-col items-center justify-center py-4">
                    <svg className="w-12 h-12 text-sky-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-900">{verificationDocument.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(verificationDocument.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-sky-600 mt-2 font-medium">Click to change document</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4">
                    <svg className="w-16 h-16 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-base font-semibold text-gray-700 mb-1">Click to upload document</p>
                    <p className="text-sm text-gray-500">JPG, PNG or PDF (max 5MB)</p>
                  </div>
                )}
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Accepted: Government ID, Business License, or Professional Certification
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800">Verification Required</p>
                <p className="text-xs text-amber-700 mt-1">
                  Your account will be pending until an admin reviews and approves your documents. This usually takes 1-2 business days.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3">
              <svg className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !verificationDocument}
            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading Document...
              </>
            ) : (
              <>
                Complete Registration
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </button>
        </form>
        )}
      </div>
    </div>
  );
}
