import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Mic, CheckCircle2, CameraOff } from "lucide-react";
import { toast } from "sonner";

const Terms = () => {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [cameraGranted, setCameraGranted] = useState(false);
  const [micGranted, setMicGranted] = useState(false);
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    if (!isAuth) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const requestCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      (window as any).cameraStream = mediaStream;
      setStream(mediaStream);
      setCameraGranted(true);
      toast.success("Camera access granted");
    } catch (error) {
      toast.error("Camera access denied. Please enable camera to continue.");
    }
  };

  const requestMicrophone = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      (window as any).micStream = mediaStream;
      setMicGranted(true);
      toast.success("Microphone access granted");
    } catch (error) {
      toast.error("Microphone access denied. Please enable microphone to continue.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && stream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataURL = canvas.toDataURL("image/png");
        setCapturedPhoto(dataURL);
        setPhotoCaptured(true);
        toast.success("Photo captured successfully");
      }
    }
  };

  const handleRetake = () => {
    setPhotoCaptured(false);
    setCapturedPhoto(null);
    toast.info("Ready to capture new photo");
  };

  const canStartExam = agreed && cameraGranted && micGranted && photoCaptured;

  const handleStartExam = async () => {
    if (canStartExam) {
      const userEmail = localStorage.getItem("userEmail");
      const token = localStorage.getItem("userToken");
      try {
        const response = await fetch("http://52.87.175.51:8000/exam/exams/start/auto", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to start exam");
        }
        const data = await response.json();
        console.log('API Response in Terms:', data);

        // Simplified: Only check attempt_id, always navigate to overview
        if (data.attempt_id && data.attempt_id > 0) {
          navigate("/overview", { state: { email: userEmail, attemptData: data } });
        } else {
          toast.error("Invalid attempt data from server");
        }
      } catch (error) {
        console.error('Start Exam Error:', error);
        toast.error("Failed to start exam. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="shadow-lg animate-fade-in">
          <CardHeader className="text-center border-b">
            <CardTitle className="text-3xl font-bold text-gradient">
              Welcome to LauraTeck Exam Platform
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Welcome, {localStorage.getItem("userEmail") || "Student"}
            </p>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Terms & Conditions */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Terms & Conditions</h3>
              <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto border">
                <div className="space-y-4 text-sm text-muted-foreground">
                  <h4 className="font-semibold text-foreground">1. Exam Integrity</h4>
                  <p>By proceeding, you agree that:</p>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>You will not use any unauthorized materials during the exam</li>
                    <li>You will not communicate with others during the exam</li>
                    <li>Your camera and microphone will remain active throughout</li>
                    <li>AI monitoring will track your activities for security purposes</li>
                  </ul>

                  <h4 className="font-semibold text-foreground">2. Privacy & Data Collection</h4>
                  <p>We collect the following data during your exam:</p>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>Video and audio recordings for proctoring</li>
                    <li>Screen activity and eye tracking data</li>
                    <li>Answer submissions and timing information</li>
                    <li>System information and browser metadata</li>
                  </ul>

                  <h4 className="font-semibold text-foreground">3. Technical Requirements</h4>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>Stable internet connection required</li>
                    <li>Working webcam and microphone mandatory</li>
                    <li>Modern browser (Chrome, Firefox, Safari, Edge)</li>
                    <li>No browser extensions or plugins that interfere with the exam</li>
                  </ul>

                  <h4 className="font-semibold text-foreground">4. Exam Rules</h4>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>Time limits are strictly enforced</li>
                    <li>Once submitted, answers cannot be changed</li>
                    <li>Suspicious activity may result in disqualification</li>
                    <li>Technical issues should be reported immediately</li>
                  </ul>

                  <h4 className="font-semibold text-foreground">5. Results & Scoring</h4>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>Results will be available after exam completion</li>
                    <li>Automated grading for MCQs and coding questions</li>
                    <li>Manual review may be conducted for flagged submissions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <Checkbox 
                id="terms" 
                checked={agreed} 
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
              />
              <label htmlFor="terms" className="text-sm cursor-pointer">
                I have read and agree to the Terms & Conditions. I understand that the exam will be monitored and recorded.
              </label>
            </div>

            {/* Permissions Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Required Permissions</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Card className={cameraGranted ? "border-green-500 bg-green-50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Camera className="text-primary" />
                        <span className="font-semibold">Camera Access</span>
                      </div>
                      {cameraGranted && <CheckCircle2 className="text-green-600" />}
                    </div>
                    <Button 
                      onClick={requestCamera} 
                      disabled={cameraGranted}
                      className="w-full"
                      variant={cameraGranted ? "secondary" : "default"}
                    >
                      {cameraGranted ? "Camera Enabled" : "Allow Camera"}
                    </Button>
                  </CardContent>
                </Card>

                <Card className={micGranted ? "border-green-500 bg-green-50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Mic className="text-primary" />
                        <span className="font-semibold">Microphone Access</span>
                      </div>
                      {micGranted && <CheckCircle2 className="text-green-600" />}
                    </div>
                    <Button 
                      onClick={requestMicrophone} 
                      disabled={micGranted}
                      className="w-full"
                      variant={micGranted ? "secondary" : "default"}
                    >
                      {micGranted ? "Microphone Enabled" : "Allow Microphone"}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Camera Preview */}
              {stream && (
                <div className="mt-4">
                  <p className="text-sm font-semibold mb-2">Camera Preview:</p>
                  <div className="relative rounded-lg overflow-hidden bg-black aspect-video max-w-sm mx-auto">
                    <video
                      autoPlay
                      muted
                      playsInline
                      ref={videoRef}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Capture Photo Section */}
              {cameraGranted && (
                <Card className={photoCaptured ? "border-green-500 bg-green-50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <CameraOff className="text-primary" />
                        <span className="font-semibold">Capture Identification Photo</span>
                      </div>
                      {photoCaptured && <CheckCircle2 className="text-green-600" />}
                    </div>
                    {!photoCaptured ? (
                      <Button 
                        onClick={capturePhoto} 
                        disabled={!stream}
                        className="w-full"
                        variant="default"
                      >
                        Capture Photo
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-center text-green-600">Photo captured!</p>
                        {capturedPhoto && (
                          <img 
                            src={capturedPhoto} 
                            alt="Captured Photo" 
                            className="w-full max-w-sm mx-auto rounded-lg shadow-md"
                          />
                        )}
                        <Button 
                          onClick={handleRetake} 
                          variant="outline"
                          className="w-full"
                        >
                          Retake Photo
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Start Exam Button */}
            <div className="pt-6">
              <Button
                onClick={handleStartExam}
                disabled={!canStartExam}
                className="w-full btn-hero text-lg py-6"
              >
                {canStartExam ? "Start Exam" : "Complete all requirements to continue"}
              </Button>
              {!canStartExam && (
                <p className="text-sm text-center text-muted-foreground mt-2">
                  Please agree to terms, grant camera & microphone access, and capture a photo
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;