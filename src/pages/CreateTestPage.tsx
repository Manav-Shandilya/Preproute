import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import TestMetadataForm from '../components/test/TestMetadataForm';
import { useTest } from '../contexts/TestContext';
import { TestFormValues } from '../types';

const CreateTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { createTest } = useTest();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: TestFormValues) => {
    setIsLoading(true);
    try {
      const newTest = await createTest({ ...values, status: "draft" });
      toast.success('Test created successfully');
      navigate(`/tests/${newTest.id}/questions`);
    } catch {
      toast.error('Failed to create test. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    navigate('/dashboard');
  };

  return (
    <div className="p-6">
      <TestMetadataForm
        onSubmit={handleSubmit}
        onSaveDraft={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CreateTestPage;
