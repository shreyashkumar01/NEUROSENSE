import { useState } from 'react';
import { useSaveCallerUserProfile, useSaveDoctorProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { UserCircle, Stethoscope } from 'lucide-react';
import type { UserProfile, DoctorProfile } from '../backend';

export default function ProfileSetup() {
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient');
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialization, setSpecialization] = useState('');

  const saveUserProfile = useSaveCallerUserProfile();
  const saveDoctorProfile = useSaveDoctorProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (userType === 'doctor' && (!licenseNumber.trim() || !specialization.trim())) {
      toast.error('Please fill in all doctor information');
      return;
    }

    try {
      const userProfile: UserProfile = {
        name: name.trim(),
        userType,
      };

      await saveUserProfile.mutateAsync(userProfile);

      if (userType === 'doctor') {
        const doctorProfile: DoctorProfile = {
          name: name.trim(),
          medicalLicenseNumber: licenseNumber.trim(),
          specialization: specialization.trim(),
        };
        await saveDoctorProfile.mutateAsync(doctorProfile);
      }

      toast.success('Profile created successfully!');
    } catch (error) {
      console.error('Profile setup error:', error);
      toast.error('Failed to create profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <img 
            src="/assets/generated/neurosense-logo.dim_300x100.png" 
            alt="NEUROSENSE" 
            className="h-10 mx-auto mb-4"
          />
          <CardTitle className="text-2xl">Welcome to NEUROSENSE</CardTitle>
          <CardDescription>Let's set up your profile to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label>I am a:</Label>
              <RadioGroup value={userType} onValueChange={(value) => setUserType(value as 'patient' | 'doctor')}>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value="patient" id="patient" />
                  <Label htmlFor="patient" className="flex items-center gap-2 cursor-pointer flex-1">
                    <UserCircle className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Patient</div>
                      <div className="text-sm text-muted-foreground">I'm here for therapy and rehabilitation</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value="doctor" id="doctor" />
                  <Label htmlFor="doctor" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Healthcare Provider</div>
                      <div className="text-sm text-muted-foreground">I'm here to monitor and support patients</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {userType === 'doctor' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="license">Medical License Number</Label>
                  <Input
                    id="license"
                    placeholder="Enter your license number"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    placeholder="e.g., Physical Therapy, Neurology"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={saveUserProfile.isPending || saveDoctorProfile.isPending}
            >
              {saveUserProfile.isPending || saveDoctorProfile.isPending ? 'Creating Profile...' : 'Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
