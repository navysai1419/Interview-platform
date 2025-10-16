import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Star, Clock, Target } from "lucide-react";
import { toast } from "sonner";

const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { questionsAttempted, totalQuestions, timeTaken } = location.state || { questionsAttempted: 0, totalQuestions: 0, timeTaken: 0 };
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [countdown, setCountdown] = useState(20);

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    if (!isAuth) {
      navigate("/");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleReturn();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const formatTimeTaken = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmitFeedback = () => {
    toast.success("Thank you for your feedback!");
    setTimeout(() => handleReturn(), 1000);
  };

  const handleReturn = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full animate-scale-in shadow-2xl">
        <CardHeader className="text-center border-b pb-8">
          <div className="mx-auto mb-6 relative">
            <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center animate-bounce-in">
              <CheckCircle2 className="text-white" size={48} />
            </div>
            <div className="absolute inset-0 w-24 h-24 bg-green-400 rounded-full animate-pulse-glow opacity-30" />
          </div>
          <CardTitle className="text-4xl font-bold text-gradient mb-2">
            Exam Submitted Successfully!
          </CardTitle>
          <p className="text-muted-foreground text-lg">
            Your answers have been recorded. Results will be available soon.
          </p>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          {/* Summary */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Target className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Questions Attempted</p>
                  <p className="text-2xl font-bold">{questionsAttempted}/{totalQuestions}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <Clock className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time Taken</p>
                  <p className="text-2xl font-bold">{formatTimeTaken(timeTaken)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feedback Form */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center">How was your exam experience?</h3>
            
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={40}
                    className={`${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>

            <Textarea
              placeholder="Share your feedback about the exam experience..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[120px]"
            />

            <Button
              onClick={handleSubmitFeedback}
              className="w-full btn-hero"
            >
              Submit Feedback
            </Button>
          </div>

          {/* Auto-redirect notice */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Redirecting to home in <span className="font-bold text-primary">{countdown}</span> seconds...
            </p>
            <Button
              onClick={handleReturn}
              variant="link"
              className="text-sm"
            >
              Return to home now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Success;