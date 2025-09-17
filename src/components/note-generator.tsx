import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { Upload, FileText, Image, Download, StickyNote, Sparkles, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface NoteGeneratorProps {
  user: any;
}

export function NoteGenerator({ user }: NoteGeneratorProps) {
  const [activeTab, setActiveTab] = useState('text');
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [generatedNotes, setGeneratedNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        setSelectedFile(file);
        setExtractedText('');
      } else {
        toast.error('Please select an image or PDF file');
      }
    }
  };

  const extractTextFromFile = async () => {
    if (!selectedFile) return;

    setExtracting(true);
    try {
      if (selectedFile.type.startsWith('image/')) {
        // For images, we'll use a simple OCR simulation
        // In a real implementation, you'd use Google Vision API or Tesseract.js
        const reader = new FileReader();
        reader.onload = () => {
          // Simulate OCR extraction
          setTimeout(() => {
            const simulatedText = `Extracted text from ${selectedFile.name}:

This is a simulation of OCR text extraction. In a real implementation, this would be the actual text extracted from your image using OCR technology.

To implement real OCR:
1. Use Google Vision API for server-side OCR
2. Use Tesseract.js for client-side OCR
3. Integrate with cloud OCR services

The extracted text would appear here and you could then generate study notes from it.`;
            setExtractedText(simulatedText);
            setExtracting(false);
            toast.success('Text extracted successfully! (Simulated)');
          }, 2000);
        };
        reader.readAsDataURL(selectedFile);
      } else if (selectedFile.type === 'application/pdf') {
        // For PDFs, we'll simulate text extraction
        setTimeout(() => {
          const simulatedText = `Extracted text from ${selectedFile.name}:

This is a simulation of PDF text extraction. In a real implementation, this would be the actual text extracted from your PDF file.

To implement real PDF text extraction:
1. Use PDF.js for client-side extraction
2. Use server-side PDF processing libraries
3. Parse PDF content and structure

The extracted text from your PDF would appear here and you could then generate comprehensive study notes from it.`;
          setExtractedText(simulatedText);
          setExtracting(false);
          toast.success('Text extracted from PDF! (Simulated)');
        }, 2000);
      }
    } catch (error) {
      console.error('OCR error:', error);
      toast.error('Failed to extract text from file');
      setExtracting(false);
    }
  };

  const generateNotes = async () => {
    const sourceText = activeTab === 'text' ? textInput : extractedText;
    const topic = topicInput || 'Study Notes';

    if (!sourceText.trim()) {
      toast.error('Please provide text content to generate notes from');
      return;
    }

    setLoading(true);
    try {
      const token = user?.access_token || localStorage.getItem('supabase.auth.token');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e9ea3e56/ai/generate-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: sourceText,
          topic: topic
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate notes');
      }

      setGeneratedNotes(data.notes);
      toast.success('Study notes generated successfully!');
    } catch (error: any) {
      console.error('Generate notes error:', error);
      toast.error(error.message || 'Failed to generate notes');
    } finally {
      setLoading(false);
    }
  };

  const downloadNotes = () => {
    if (!generatedNotes) return;

    const element = document.createElement('a');
    const file = new Blob([generatedNotes], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${topicInput || 'study-notes'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Notes downloaded successfully!');
  };

  const clearAll = () => {
    setTextInput('');
    setTopicInput('');
    setExtractedText('');
    setGeneratedNotes('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <StickyNote className="h-6 w-6 text-green-600" />
            <span>AI Note Generator</span>
          </CardTitle>
          <CardDescription>
            Create comprehensive study notes from text, images, or PDF files using AI
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Source Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Topic Input */}
              <div>
                <Label htmlFor="topic">Topic/Subject (Optional)</Label>
                <Input
                  id="topic"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="e.g., Photosynthesis, World War II, Calculus"
                />
              </div>

              {/* Source Input Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text" className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>Text Input</span>
                  </TabsTrigger>
                  <TabsTrigger value="file" className="flex items-center space-x-1">
                    <Upload className="h-4 w-4" />
                    <span>Image/PDF</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  <div>
                    <Label htmlFor="textContent">Paste or type your content</Label>
                    <Textarea
                      id="textContent"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Paste your study material, lecture notes, or any text content here..."
                      className="min-h-[200px]"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="file" className="space-y-4">
                  <div>
                    <Label>Upload Image or PDF</Label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="space-y-2">
                        <div className="flex justify-center">
                          <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3">
                            <Upload className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Supports: JPG, PNG, GIF, PDF (Max 10MB)
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </Button>
                      </div>
                    </div>
                  </div>

                  {selectedFile && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Image className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">{selectedFile.name}</span>
                          <Badge variant="secondary">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </Badge>
                        </div>
                        <Button
                          onClick={extractTextFromFile}
                          disabled={extracting}
                          size="sm"
                        >
                          {extracting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Extracting...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Extract Text
                            </>
                          )}
                        </Button>
                      </div>

                      {extractedText && (
                        <div className="space-y-2">
                          <Label>Extracted Text</Label>
                          <Textarea
                            value={extractedText}
                            onChange={(e) => setExtractedText(e.target.value)}
                            className="min-h-[150px]"
                            placeholder="Extracted text will appear here..."
                          />
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  onClick={generateNotes}
                  disabled={loading || (!textInput.trim() && !extractedText.trim())}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Notes
                    </>
                  )}
                </Button>
                <Button onClick={clearAll} variant="outline">
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Generated Study Notes</CardTitle>
                {generatedNotes && (
                  <Button onClick={downloadNotes} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedNotes ? (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        AI-Generated Notes
                      </span>
                    </div>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {generatedNotes}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <StickyNote className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Notes Generated Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your content and click "Generate Notes" to create AI-powered study notes
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Tips for Better Notes:</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Provide clear, well-structured source material</li>
                <li>• Specify the topic/subject for more focused notes</li>
                <li>• Include key concepts and important details</li>
                <li>• Review and edit the generated notes as needed</li>
                <li>• Use high-quality images for better OCR results</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}