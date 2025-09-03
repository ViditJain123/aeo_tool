'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useBrandStore } from '@/stores/brandStore';
import { APP_CONFIG } from '@/config/app';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { InputModal } from '@/components/InputModal';
import { setPrompts, formatPromptsForAPI } from '@/services/prompts';
import { useRouter } from 'next/navigation';

function Page() {
  const { prompts, removeQuestion, addQuestion, addCategory, brandId } = useBrandStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [deleteModal, setDeleteModal] = React.useState<{
    isOpen: boolean;
    categoryIndex: number;
    questionIndex: number;
    questionText: string;
  }>({
    isOpen: false,
    categoryIndex: -1,
    questionIndex: -1,
    questionText: '',
  });

  const [addModal, setAddModal] = React.useState<{
    isOpen: boolean;
    categoryIndex: number;
    categoryName: string;
  }>({
    isOpen: false,
    categoryIndex: -1,
    categoryName: '',
  });

  const [createCategoryModal, setCreateCategoryModal] = React.useState({
    isOpen: false,
  });

  const handleContinue = async () => {
    if (!brandId) {
      console.error('Brand ID is missing');
      return;
    }

    setIsLoading(true);
    try {
      const promptData = formatPromptsForAPI(prompts);
      const response = await setPrompts(brandId, promptData);
      
      if (response.success) {
        // Navigate to next step or dashboard
        router.push('/'); // You can change this to wherever you want to navigate after success
      } else {
        console.error('Failed to save prompts:', response.message);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error('Error saving prompts:', error);
      // You could show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategoryClick = () => {
    setCreateCategoryModal({ isOpen: true });
  };

  const handleCreateCategoryConfirm = (categoryName: string) => {
    addCategory(categoryName);
    setCreateCategoryModal({ isOpen: false });
  };

  const handleCreateCategoryCancel = () => {
    setCreateCategoryModal({ isOpen: false });
  };

  const handleAddClick = (categoryIndex: number, categoryName: string) => {
    setAddModal({
      isOpen: true,
      categoryIndex,
      categoryName,
    });
  };

  const handleAddConfirm = (query: string) => {
    addQuestion(addModal.categoryIndex, query);
    setAddModal({
      isOpen: false,
      categoryIndex: -1,
      categoryName: '',
    });
  };

  const handleAddCancel = () => {
    setAddModal({
      isOpen: false,
      categoryIndex: -1,
      categoryName: '',
    });
  };

  const handleDeleteClick = (categoryIndex: number, questionIndex: number, questionText: string) => {
    setDeleteModal({
      isOpen: true,
      categoryIndex,
      questionIndex,
      questionText,
    });
  };

  const handleDeleteConfirm = () => {
    removeQuestion(deleteModal.categoryIndex, deleteModal.questionIndex);
    setDeleteModal({
      isOpen: false,
      categoryIndex: -1,
      questionIndex: -1,
      questionText: '',
    });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      categoryIndex: -1,
      questionIndex: -1,
      questionText: '',
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{APP_CONFIG.name} Setup</CardTitle>
          <p className="text-muted-foreground">Review and customize your AI search prompts</p>
        </CardHeader>
        
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {prompts.map((category, index) => (
                <Card key={index} className="border">
                  <CardHeader>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardAction>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAddClick(index, category.name)}
                      >
                        +
                      </Button>
                    </CardAction>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {category.questions.map((prompt, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                          <span className="flex-1 text-sm">{prompt}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                            onClick={() => handleDeleteClick(index, idx, prompt)}
                          >
                            ×
                          </Button>
                        </div>
                        {idx < category.questions.length - 1 && <Separator className="my-2" />}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
          
          <div className="flex justify-center gap-4 mt-6">
            <Button variant="outline" onClick={handleCreateCategoryClick} disabled={isLoading}>
              Create Category
            </Button>
            <Button onClick={handleContinue} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Query"
        description={`Are you sure you want to delete the query "${deleteModal.questionText}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />

      <InputModal
        isOpen={addModal.isOpen}
        onClose={handleAddCancel}
        onConfirm={handleAddConfirm}
        title="Add New Query"
        description={`Add a new query to the "${addModal.categoryName}" category`}
        placeholder="Enter your query here..."
        confirmText="Add Query"
        cancelText="Cancel"
        inputLabel="Query"
      />

      <InputModal
        isOpen={createCategoryModal.isOpen}
        onClose={handleCreateCategoryCancel}
        onConfirm={handleCreateCategoryConfirm}
        title="Create New Category"
        description="Enter the name for the new category"
        placeholder="Enter category name..."
        confirmText="Create Category"
        cancelText="Cancel"
        inputLabel="Category Name"
      />
    </div>
  );
}

export default Page;