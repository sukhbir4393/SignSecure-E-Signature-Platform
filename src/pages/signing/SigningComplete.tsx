import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Download, FileText } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card, { CardBody } from '../../components/ui/Card';

const SigningComplete: React.FC = () => {
  return (
    <div className="max-w-lg mx-auto py-12 px-4 text-center animate-fade-in">
      <Card className="bg-white mb-8">
        <CardBody className="py-12 px-8">
          <div className="rounded-full bg-success-100 p-4 inline-flex mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-success-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Document Signed Successfully!
          </h1>
          
          <p className="text-gray-600 mb-8">
            Thank you for signing the document. All parties will be notified via email when the document is complete.
          </p>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              A copy of the document will be emailed to you once all parties have signed.
            </p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
              <h3 className="text-sm font-medium text-gray-900 mb-1">What happens next?</h3>
              <ul className="text-sm text-gray-600 space-y-2 pl-5 list-disc">
                <li>Other signers (if any) will be notified to sign the document</li>
                <li>You'll receive email notifications about the signing progress</li>
                <li>Once all parties have signed, you'll receive the completed document</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
      
      <div className="space-y-4">
        <Button
          as={Link}
          to="/login"
          variant="primary"
          fullWidth
          size="lg"
          leftIcon={<FileText className="h-5 w-5" />}
        >
          Return to SignSecure
        </Button>
      </div>
    </div>
  );
};

export default SigningComplete;