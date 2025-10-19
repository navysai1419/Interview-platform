import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, Camera, CheckCircle2, AlertCircle, Image as ImageIcon } from "lucide-react"; // Added ImageIcon for placeholder
import { toast } from "sonner";

interface Option {
  id: number;
  text: string;
  image_url?: string | null;
}

interface Question {
  question_id: number;
  subject: string;
  text: string;
  image_url?: string | null;
  options: Option[];
}

interface ExamState {
  questions: Question[];
  ends_at: string;
  attempt_id: number;
  subject: string;
}

const Exam = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { questions: passedQuestions, ends_at, attempt_id, subject } = location.state as ExamState || {};
  const userEmail = localStorage.getItem("userEmail") || "Student";
  const [timeLeft, setTimeLeft] = useState(0);
  const [warningMessage, setWarningMessage] = useState<string>("");
  const [elapsed, setElapsed] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showAlert, setShowAlert] = useState(false);
  const [showTimeUpAlert, setShowTimeUpAlert] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set()); // Track failed image URLs (keyed by URL for uniqueness)
  const videoRef = useRef<HTMLVideoElement>(null);

  const allQuestions: Question[] = passedQuestions || [];

  // Helper to handle image load success
  const handleImageLoad = (url: string) => {
    console.log(`Image loaded successfully: ${url}`);
    setImageErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(url);
      return newSet;
    });
  };

  // Helper to handle image load error
  const handleImageError = (url: string, type: 'question' | 'option') => {
    console.error(`Failed to load ${type} image: ${url}`);
    setImageErrors(prev => new Set([...prev, url]));
    toast.error(`Image not loading for ${type}: ${url}`); // Optional toast for user feedback
  };

  // Placeholder component for failed images
  const ImagePlaceholder = ({ type }: { type: 'question' | 'option' }) => (
    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
      <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
      <span className="text-sm text-gray-500">Image not available ({type})</span>
    </div>
  );

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    if (!isAuth || !allQuestions.length || !ends_at || !subject) {
      navigate("/");
      return;
    }

    // Initial time calculation (+5:30 hours for UTC)
    const parsed = new Date(ends_at);
    const adjusted = new Date(parsed.getTime() + (5 * 60 * 60 + 30 * 60) * 1000);
    const parsedEndsAt = adjusted.getTime();
    let initialTimeLeft = Math.max(0, Math.floor((parsedEndsAt - Date.now()) / 1000));
    setTimeLeft(initialTimeLeft);

    updateWarning(initialTimeLeft);

    const timer = setInterval(() => {
      const parsedTimer = new Date(ends_at);
      const adjustedTimer = new Date(parsedTimer.getTime() + (5 * 60 * 60 + 30 * 60) * 1000);
      const currentEndsAt = adjustedTimer.getTime();
      const currentTimeLeft = Math.max(0, Math.floor((currentEndsAt - Date.now()) / 1000));
      setTimeLeft(currentTimeLeft);
      updateWarning(currentTimeLeft);
      setElapsed((prev) => {
        const newElapsed = prev + 1;
        if (newElapsed % 300 === 0 && newElapsed > 0) {
          setShowAlert(true);
        }
        return newElapsed;
      });
      if (currentTimeLeft <= 0) {
        clearInterval(timer);
        setShowTimeUpAlert(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, ends_at]);

  useEffect(() => {
    const cameraStream = (window as any).cameraStream as MediaStream | undefined;
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, []);

  useEffect(() => {
    if (showAlert) {
      const alertTimer = setTimeout(() => {
        setShowAlert(false);
      }, 5000);
      return () => clearTimeout(alertTimer);
    }
  }, [showAlert]);

  const updateWarning = (timeLeft: number) => {
    if (timeLeft <= 60) {
      setWarningMessage("Time is over! Please submit the task.");
    } else if (timeLeft <= 300) {
      setWarningMessage("You have 5 minutes to over!");
    } else {
      setWarningMessage("");
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentQ = allQuestions[currentQuestion];

  const handleAnswerChange = (value: string) => {
    setAnswers({ ...answers, [currentQ.question_id]: Number(value) });
  };

  const handleNext = () => {
    if (currentQuestion < allQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    // Disabled: no going back
  };

  const handleQuestionClick = (index: number) => {
    if (index >= currentQuestion) {
      setCurrentQuestion(index);
    }
  };

  const handleSectionSubmit = () => {
    const confirmed = window.confirm(`Are you sure you want to submit the ${subject} section?`);
    if (!confirmed) return;

    const answersArray = Object.entries(answers).map(([qId, optionId]) => ({
      question_id: parseInt(qId),
      chosen_option_id: optionId,
    }));

    toast.success(`${subject} section submitted successfully! (${answersArray.length}/${allQuestions.length} answered)`);
    navigate("/overview", {
      state: {
        attemptData: { attempt_id, ends_at },
        fromExam: {
          subject,
          answers: answersArray,
          totalQuestions: allQuestions.length,
        },
      },
    });
  };

  const handleTimeUpConfirm = () => {
    setShowTimeUpAlert(false);
    const answersArray = Object.entries(answers).map(([qId, optionId]) => ({
      question_id: parseInt(qId),
      chosen_option_id: optionId,
    }));
    toast.success(`Time up for ${subject}. Auto-saving answers.`);
    navigate("/overview", {
      state: {
        attemptData: { attempt_id, ends_at },
        fromExam: {
          subject,
          answers: answersArray,
          totalQuestions: allQuestions.length,
        },
        timeUp: true,
      },
    });
  };

  const timerColor = timeLeft <= 300 ? 'text-red-600' : 'text-primary';

  if (!allQuestions.length) {
    return <div>No questions available</div>;
  }

  return (
    <>
      {/* Time Up Alert */}
      {showTimeUpAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Time is Up!</h3>
            <p className="mb-4">Your exam time has expired. Do you want to submit now?</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => navigate("/overview")}>
                Cancel
              </Button>
              <Button onClick={handleTimeUpConfirm}>Submit</Button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 relative">
        {/* Proctoring Video - Bottom Left Corner */}
        <div className="fixed bottom-4 left-4 z-40">
          <div className="bg-black rounded-lg overflow-hidden shadow-lg">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-32 h-24 object-cover"
            />
            <div className="bg-black bg-opacity-50 text-white text-xs p-1 text-center">
              Live Proctoring
            </div>
          </div>
        </div>

        {/* Top Bar */}
        <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Clock className="text-primary" size={24} />
                <div>
                  <span className={`text-xl font-bold ${timerColor} block`}>{formatTime(timeLeft)}</span>
                  {warningMessage && (
                    <span className="text-sm font-semibold text-red-600 block">{warningMessage}</span>
                  )}
                </div>
              </div>

              {showAlert && (
                <div className="mx-auto px-4 py-2 bg-red-100 border border-red-500 rounded-lg animate-pulse flex items-center space-x-2">
                  <AlertCircle className="text-red-600 w-5 h-5" />
                  <span className="text-red-700 font-bold text-sm">Don't swtch between tabs.</span>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Camera size={16} className="text-green-600" />
                  <span className="text-muted-foreground">Monitoring Active</span>
                </div>
                <div className="text-sm text-right">
                  <p className="text-muted-foreground text-xs">Student</p>
                  <p className="font-semibold text-sm">{userEmail}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white font-semibold">
                  {userEmail.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-73px)]">
          {/* Left Sidebar - Question Navigation */}
          <div className="w-80 bg-white border-r overflow-y-auto">
            <div className="p-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">{subject} Section - Questions ({allQuestions.length})</h3>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {allQuestions.map((q, idx) => (
                  <button
                    key={q.question_id}
                    onClick={() => handleQuestionClick(idx)}
                    disabled={idx < currentQuestion}
                    className={`
                      p-2 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                      ${currentQuestion === idx 
                        ? "border-primary bg-primary text-white" 
                        : answers[q.question_id] 
                          ? "border-green-500 bg-green-50 text-green-700" 
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <Button
                onClick={handleSectionSubmit}
                className="w-full mt-6 bg-green-600 hover:bg-green-700"
              >
                Submit {subject} Section
              </Button>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-muted-foreground">
                        Question {currentQuestion + 1} of {allQuestions.length}
                      </h3>
                      {answers[currentQ.question_id] && (
                        <span className="text-sm text-green-600 flex items-center">
                          <CheckCircle2 size={16} className="mr-1" /> Answered
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold mb-6">{currentQ.text}</h2>
                    {currentQ.image_url && (
                      <div className="mb-6">
                        {imageErrors.has(currentQ.image_url) ? (
                          <ImagePlaceholder type="question" />
                        ) : (
                          <img
                            src={currentQ.image_url}
                            alt={`Question ${currentQuestion + 1} image`}
                            className="max-w-full h-auto mx-auto rounded-lg shadow-md"
                            onLoad={() => handleImageLoad(currentQ.image_url!)}
                            onError={() => handleImageError(currentQ.image_url!, 'question')}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  <RadioGroup
                    value={answers[currentQ.question_id]?.toString()}
                    onValueChange={handleAnswerChange}
                  >
                    <div className="space-y-4">
                      {currentQ.options.map((option) => (
                        <div
                          key={option.id}
                          className={`
                            flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                            ${answers[currentQ.question_id] === option.id 
                              ? "border-primary bg-blue-50" 
                              : "border-gray-200 hover:border-gray-300"
                            }
                          `}
                        >
                          <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
                          <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                            <div className="flex flex-col items-start space-y-2">
                              {option.image_url && (
                                <div className="w-32 h-32"> {/* Fixed height container for consistency */}
                                  {imageErrors.has(option.image_url) ? (
                                    <ImagePlaceholder type="option" />
                                  ) : (
                                    <img
                                      src={option.image_url}
                                      alt={`Option ${option.id} for Question ${currentQuestion + 1}`}
                                      className="w-full h-full object-contain rounded border"
                                      onLoad={() => handleImageLoad(option.image_url!)}
                                      onError={() => handleImageError(option.image_url!, 'option')}
                                    />
                                  )}
                                </div>
                              )}
                              {option.text && <span>{option.text}</span>}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>

                  <div className="flex justify-between pt-6">
                    <Button
                      onClick={handlePrevious}
                      disabled={true}
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <Button onClick={handleNext} disabled={currentQuestion === allQuestions.length - 1}>
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Exam;