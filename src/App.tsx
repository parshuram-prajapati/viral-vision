import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Instagram, 
  Zap, 
  Target, 
  MessageSquare, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCcw,
  Sparkles,
  Eye,
  Video,
  FileText,
  Brain,
  Lightbulb,
  Rocket,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  Users,
  Play,
  Share2,
  Lock,
  Youtube,
  Search,
  Map,
  Compass,
  Flag,
  Trophy,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  analyzeContent, 
  analyzeInstagramMetrics, 
  analyzeCompetitor,
  generateBeginnerRoadmap,
  CreatorContext, 
  AnalysisResult, 
  InstagramInsights, 
  InstagramAnalysis,
  CompetitorData,
  CompetitorAnalysis,
  BeginnerRoadmap
} from "./services/geminiService";

type Step = "welcome" | "context" | "dashboard" | "loading" | "results" | "scriptGen" | "videoLab" | "competitor" | "roadmap";

export default function App() {
  const [step, setStep] = useState<Step>("welcome");
  const [isConnected, setIsConnected] = useState(false);
  const [platform, setPlatform] = useState<"Instagram" | "YouTube">("Instagram");
  const [context, setContext] = useState<CreatorContext>({
    goal: "",
    niche: "",
    targetAudience: "",
    emotion: "",
    platform: "Instagram",
  });
  const [insights, setInsights] = useState<InstagramInsights | null>(null);
  const [analysis, setAnalysis] = useState<InstagramAnalysis | null>(null);
  const [scriptTopic, setScriptTopic] = useState("");
  const [scriptResult, setScriptResult] = useState<AnalysisResult | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoAnalysis, setVideoAnalysis] = useState<AnalysisResult | null>(null);
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [competitorResult, setCompetitorResult] = useState<CompetitorAnalysis | null>(null);
  const [roadmap, setRoadmap] = useState<BeginnerRoadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OAuth Listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setIsConnected(true);
        fetchInsights();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [platform]);

  const handleConnect = async (targetPlatform: "Instagram" | "YouTube") => {
    setPlatform(targetPlatform);
    setContext(prev => ({ ...prev, platform: targetPlatform }));
    try {
      const endpoint = targetPlatform === "Instagram" ? '/api/auth/instagram/url' : '/api/auth/youtube/url';
      const response = await fetch(endpoint);
      const { url } = await response.json();
      window.open(url, `${targetPlatform.toLowerCase()}_oauth`, 'width=600,height=700');
    } catch (err) {
      console.error(`Failed to get ${targetPlatform} auth URL`, err);
      setIsConnected(true);
      fetchInsights();
    }
  };

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const endpoint = platform === "Instagram" ? '/api/instagram/insights' : '/api/youtube/insights';
      const response = await fetch(endpoint);
      const data = await response.json();
      setInsights(data);
      setStep("context");
    } catch (err) {
      setError("Failed to fetch insights");
    } finally {
      setLoading(false);
    }
  };

  const handleContextSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleAnalyzeMetrics();
  };

  const handleAnalyzeMetrics = async () => {
    if (!insights) return;
    setStep("loading");
    try {
      const result = await analyzeInstagramMetrics(insights, context);
      setAnalysis(result);
      setStep("results");
    } catch (err) {
      setError("Analysis failed");
      setStep("context");
    }
  };

  const handleAnalyzeCompetitor = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/competitor/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: competitorUrl })
      });
      const data: CompetitorData = await response.json();
      const result = await analyzeCompetitor(data, context);
      setCompetitorResult(result);
    } catch (err) {
      setError("Competitor analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    setLoading(true);
    try {
      const result = await generateBeginnerRoadmap(context);
      setRoadmap(result);
      setStep("roadmap");
    } catch (err) {
      setError("Roadmap generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleAnalyzeVideo = async () => {
    setLoading(true);
    try {
      const result = await analyzeContent(context, "Analyze this video for editing, color correction, and visual engagement. (Simulated video analysis)");
      setVideoAnalysis(result);
    } catch (err) {
      setError("Video analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateScript = async () => {
    setLoading(true);
    try {
      const result = await analyzeContent(context, `Topic: ${scriptTopic}. Generate a viral Instagram Reel script.`);
      setScriptResult(result);
      setStep("scriptGen");
    } catch (err) {
      setError("Script generation failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("welcome");
    setIsConnected(false);
    setInsights(null);
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen selection:bg-pink-500/30">
      <div className="atmosphere" />
      
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={reset}>
            <div className="bg-gradient-to-tr from-purple-600 to-pink-500 p-2 rounded-2xl shadow-lg shadow-pink-500/20">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-2xl font-extrabold tracking-tight">ViralVision<span className="text-pink-500">.ai</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-white/90">
            <span className="hover:text-white cursor-pointer transition-colors" onClick={() => setStep("results")}>Insights</span>
            <span className="hover:text-white cursor-pointer transition-colors" onClick={() => setStep("videoLab")}>Video Lab</span>
            <span className="hover:text-white cursor-pointer transition-colors" onClick={() => setStep("competitor")}>Competitor</span>
            <span className="hover:text-white cursor-pointer transition-colors" onClick={() => setStep("scriptGen")}>Script Lab</span>
            <span className="hover:text-white cursor-pointer transition-colors" onClick={() => setStep("roadmap")}>Roadmap</span>
          </div>

          <div className="flex items-center gap-4">
            {isConnected ? (
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1 backdrop-blur-md">
                <CheckCircle2 className="w-3 h-3 mr-1.5" /> {platform} Connected
              </Badge>
            ) : (
              <div className="flex gap-2">
                <Button onClick={() => handleConnect("Instagram")} className="glass-button bg-pink-600/20 hover:bg-pink-600/40 border-pink-500/30">
                  <Instagram className="w-4 h-4 mr-2" /> Instagram
                </Button>
                <Button onClick={() => handleConnect("YouTube")} className="glass-button bg-red-600/20 hover:bg-red-600/40 border-red-500/30">
                  <Youtube className="w-4 h-4 mr-2" /> YouTube
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="text-center space-y-12"
            >
              <div className="space-y-6">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Badge className="bg-white/5 text-white/90 border-white/10 px-4 py-1.5 text-xs font-bold tracking-widest uppercase">
                    Next-Gen Instagram Analytics
                  </Badge>
                </motion.div>
                <h1 className="font-display text-7xl md:text-9xl font-extrabold leading-[0.9] tracking-tighter">
                  Master the <br />
                  <span className="gradient-text">Algorithm.</span>
                </h1>
                <p className="text-xl text-white/80 max-w-2xl mx-auto font-medium leading-relaxed">
                  Connect your Instagram to get deep AI insights on retention, skip rates, and watch time. 
                  Turn data into viral content with our AI storytelling coach.
                </p>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <div className="flex gap-4">
                  <Button 
                    onClick={() => handleConnect("Instagram")}
                    className="bg-white text-black hover:bg-white/90 rounded-full text-xl py-8 px-10 h-auto font-bold group shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                  >
                    <Instagram className="mr-3 w-6 h-6" /> Instagram
                  </Button>
                  <Button 
                    onClick={() => handleConnect("YouTube")}
                    className="bg-red-600 text-white hover:bg-red-700 rounded-full text-xl py-8 px-10 h-auto font-bold group shadow-[0_0_30px_rgba(220,38,38,0.3)]"
                  >
                    <Youtube className="mr-3 w-6 h-6" /> YouTube
                  </Button>
                </div>
                <Button variant="ghost" className="text-white/80 hover:text-white text-lg" onClick={handleGenerateRoadmap}>
                  <Map className="mr-2 w-5 h-5" /> Beginner Roadmap
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
                {[
                  { icon: BarChart3, title: "Deep Analytics", desc: "Real-time retention and skip rate analysis for every Reel." },
                  { icon: Brain, title: "AI Coaching", desc: "Personalized suggestions to fix your editing and storytelling." },
                  { icon: Sparkles, title: "Viral Scripts", desc: "Generate high-retention scripts based on your unique data." }
                ].map((f, i) => (
                  <div key={i} className="glass-card p-8 text-left hover:bg-white/10 transition-colors group">
                    <div className="bg-white/5 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <f.icon className="w-6 h-6 text-pink-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                    <p className="text-white/70 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === "context" && (
            <motion.div
              key="context"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-2xl mx-auto space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="font-display text-5xl font-bold tracking-tight">Tell us about your <span className="text-pink-500">Vision</span></h2>
                <p className="text-white/70">We'll use this to tailor our AI analysis to your specific goals.</p>
              </div>

              <form onSubmit={handleContextSubmit} className="glass-card p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-white/90 font-semibold ml-1">What's your niche?</Label>
                    <Input 
                      placeholder="e.g. Fitness, Tech, Lifestyle" 
                      className="bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-pink-500/50"
                      value={context.niche}
                      onChange={e => setContext({...context, niche: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-white/90 font-semibold ml-1">Target Audience</Label>
                    <Input 
                      placeholder="e.g. Gen Z, Entrepreneurs" 
                      className="bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-pink-500/50"
                      value={context.targetAudience}
                      onChange={e => setContext({...context, targetAudience: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-white/70 font-semibold ml-1">Primary Goal</Label>
                  <Input 
                    placeholder="e.g. Brand awareness, Sales, Community" 
                    className="bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-pink-500/50"
                    value={context.goal}
                    onChange={e => setContext({...context, goal: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-500 h-16 rounded-2xl text-lg font-bold shadow-xl shadow-pink-500/20">
                  Analyze My Account <Sparkles className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </motion.div>
          )}

          {step === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[500px] space-y-12"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-32 h-32 border-4 border-white/5 border-t-pink-500 rounded-full"
                />
                <Brain className="w-12 h-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-pink-500" />
              </div>
              <div className="text-center space-y-4">
                <h3 className="text-3xl font-bold">Processing Insights...</h3>
                <p className="text-white/60 max-w-sm mx-auto">Our AI is analyzing your retention curves and identifying viral patterns in your recent media.</p>
              </div>
            </motion.div>
          )}

          {step === "results" && analysis && insights && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="space-y-2">
                  <h2 className="font-display text-6xl font-bold tracking-tight">Account <span className="gradient-text">Report</span></h2>
                  <p className="text-white/70 font-medium">Data-driven strategy for your {context.niche} brand.</p>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" className="glass-button" onClick={() => setStep("context")}>
                    Edit Context
                  </Button>
                  <Button className="bg-white text-black hover:bg-white/90 rounded-full px-8" onClick={() => setStep("scriptGen")}>
                    Generate Next Script
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard label="Avg. Retention" value={`${insights.retention}%`} icon={Users} color="text-blue-300" />
                <MetricCard label="Skip Rate" value={`${insights.skipRate}%`} icon={Zap} color="text-yellow-300" />
                <MetricCard label="Watch Time" value={`${insights.averageWatchTime}s`} icon={Play} color="text-green-300" />
                <MetricCard label="Engagement" value={`${insights.engagementRate}%`} icon={MessageSquare} color="text-pink-300" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="glass-card p-8 space-y-6">
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                      <Brain className="text-pink-500" /> AI Strategic Insights
                    </h3>
                    <div className="space-y-4">
                      {analysis.keyInsights.map((insight, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div className="bg-pink-500/20 text-pink-400 w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold">
                            {i + 1}
                          </div>
                          <p className="text-white/80 leading-relaxed">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="glass-card p-8 space-y-4">
                      <h4 className="text-lg font-bold text-blue-300 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" /> Retention Fix
                      </h4>
                      <p className="text-white/80 text-sm leading-relaxed">{analysis.retentionAdvice}</p>
                    </div>
                    <div className="glass-card p-8 space-y-4">
                      <h4 className="text-lg font-bold text-yellow-300 flex items-center gap-2">
                        <Zap className="w-5 h-5" /> Skip Rate Fix
                      </h4>
                      <p className="text-white/80 text-sm leading-relaxed">{analysis.skipRateAdvice}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="gradient-border">
                    <div className="gradient-border-content p-8 space-y-6">
                      <h3 className="text-2xl font-bold flex items-center gap-3">
                        <Rocket className="text-red-500" /> Viral Potential
                      </h3>
                      <p className="text-white/80 leading-relaxed font-medium">
                        {analysis.viralPotential}
                      </p>
                      <Separator className="bg-white/10" />
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-white/70">Content Suggestions</h4>
                        <ul className="space-y-3">
                          {analysis.contentSuggestions.map((s, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-pink-500 mt-0.5 shrink-0" />
                              <span className="text-white/90">{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Card className="glass-card border-none">
                    <CardHeader>
                      <CardTitle className="text-xl">Recent Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {insights.recentPosts.map((post, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="bg-white/10 p-2 rounded-lg">
                              {post.type === "REEL" ? <Play className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white/60">{post.type}</p>
                              <p className="text-sm font-medium">{post.views.toLocaleString()} views</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-pink-500">{post.retention}% ret.</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {step === "scriptGen" && (
            <motion.div
              key="scriptGen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-12"
            >
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => setStep("results")} className="hover:bg-white/5 rounded-full">
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <h2 className="font-display text-5xl font-bold tracking-tight">Script <span className="text-pink-500">Lab</span></h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-6">
                  <div className="glass-card p-6 space-y-4">
                    <Label className="text-white/90 font-semibold">What's the next video about?</Label>
                    <Textarea 
                      placeholder="e.g. 3 tips for morning productivity, My workout routine..." 
                      className="bg-white/5 border-white/10 min-h-[150px] rounded-2xl"
                      value={scriptTopic}
                      onChange={e => setScriptTopic(e.target.value)}
                    />
                    <Button 
                      onClick={handleGenerateScript} 
                      disabled={loading || !scriptTopic}
                      className="w-full bg-pink-600 hover:bg-pink-700 rounded-xl h-12 font-bold"
                    >
                      {loading ? "Generating..." : "Generate Script"}
                    </Button>
                  </div>
                  
                  <div className="glass-card p-6 bg-blue-500/5 border-blue-500/20">
                    <h4 className="font-bold flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-blue-400" /> Pro Tip
                    </h4>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Based on your data, videos between 12-15 seconds perform best. Try to keep your script concise.
                    </p>
                  </div>
                </div>

                <div className="md:col-span-2">
                  {scriptResult ? (
                    <div className="space-y-6">
                      <div className="glass-card p-8 space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="text-2xl font-bold">Your Viral Script</h3>
                          <Badge className="bg-pink-500">High Retention</Badge>
                        </div>
                        <ScrollArea className="h-[400px] pr-4">
                          <div className="space-y-6 text-white/80 leading-relaxed">
                            <div className="space-y-2">
                              <h4 className="text-pink-500 font-bold uppercase text-xs tracking-widest">The Hook</h4>
                              <p className="bg-white/5 p-4 rounded-xl border border-white/5 font-medium italic">
                                {scriptResult.improvementSuggestions.hookRewrites[0]}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-pink-500 font-bold uppercase text-xs tracking-widest">The Body</h4>
                              <p className="whitespace-pre-wrap">{scriptResult.improvementSuggestions.scriptImprovements}</p>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-pink-500 font-bold uppercase text-xs tracking-widest">Call to Action</h4>
                              <p className="font-bold">{scriptResult.scriptAnalysis.cta}</p>
                            </div>
                          </div>
                        </ScrollArea>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="glass-card p-4">
                          <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Suggested Title</p>
                          <p className="text-sm font-bold">{scriptResult.viralityBoost.titles[0]}</p>
                        </div>
                        <div className="glass-card p-4">
                          <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Thumbnail Hook</p>
                          <p className="text-sm font-bold">{scriptResult.viralityBoost.thumbnailIdeas[0]}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-card h-full flex flex-col items-center justify-center text-center p-12 space-y-4 border-dashed">
                      <div className="bg-white/5 p-6 rounded-full">
                        <FileText className="w-12 h-12 text-white/20" />
                      </div>
                      <h3 className="text-xl font-bold text-white/40">Enter a topic to generate your script</h3>
                      <p className="text-sm text-white/20 max-w-xs">We'll use your account's retention patterns to craft the perfect script.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          {step === "competitor" && (
            <motion.div
              key="competitor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-12"
            >
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => setStep("results")} className="hover:bg-white/5 rounded-full">
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <h2 className="font-display text-5xl font-bold tracking-tight">Competitor <span className="text-pink-500">Analysis</span></h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-6">
                  <div className="glass-card p-6 space-y-4">
                    <Label className="text-white/90 font-semibold">Paste Video URL</Label>
                    <div className="relative">
                      <Input 
                        placeholder="YouTube or Instagram URL" 
                        className="bg-white/5 border-white/10 h-12 rounded-xl pr-10"
                        value={competitorUrl}
                        onChange={e => setCompetitorUrl(e.target.value)}
                      />
                      <Search className="absolute right-3 top-3 w-5 h-5 text-white/40" />
                    </div>
                    <Button 
                      onClick={handleAnalyzeCompetitor} 
                      disabled={loading || !competitorUrl}
                      className="w-full bg-white text-black hover:bg-white/90 rounded-xl h-12 font-bold"
                    >
                      {loading ? "Analyzing..." : "Analyze Viral Secrets"}
                    </Button>
                  </div>
                  
                  <div className="glass-card p-6 bg-purple-500/5 border-purple-500/20">
                    <h4 className="font-bold flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-400" /> Why this works
                    </h4>
                    <p className="text-xs text-white/70 leading-relaxed">
                      We reverse-engineer the hook, pacing, and retention triggers of any viral video to help you replicate its success.
                    </p>
                  </div>
                </div>

                <div className="md:col-span-2">
                  {competitorResult ? (
                    <div className="space-y-6">
                      <div className="glass-card p-8 space-y-8">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h3 className="text-2xl font-bold">Viral Breakdown</h3>
                            <p className="text-white/60 text-sm flex items-center gap-2">
                              <Trophy className="w-4 h-4 text-yellow-500" /> High Performance Strategy
                            </p>
                          </div>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/20">Replicable</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <h4 className="text-pink-500 font-bold uppercase text-xs tracking-widest">Viral Techniques</h4>
                            <ul className="space-y-2">
                              {competitorResult.viralTechniques.map((t, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                                  <Zap className="w-3 h-3 text-pink-500 mt-1 shrink-0" /> {t}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-pink-500 font-bold uppercase text-xs tracking-widest">Estimated Effort</h4>
                            <p className="text-sm text-white/70">{competitorResult.estimatedEffort}</p>
                          </div>
                        </div>

                        <Separator className="bg-white/10" />

                        <div className="space-y-6">
                          <div className="space-y-2">
                            <h4 className="text-purple-400 font-bold uppercase text-xs tracking-widest">The Hook Secret</h4>
                            <p className="text-white/80 leading-relaxed text-sm">{competitorResult.hookAnalysis}</p>
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-purple-400 font-bold uppercase text-xs tracking-widest">Pacing Strategy</h4>
                            <p className="text-white/80 leading-relaxed text-sm">{competitorResult.pacingSecrets}</p>
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-purple-400 font-bold uppercase text-xs tracking-widest">How to Replicate</h4>
                            <p className="bg-white/5 p-4 rounded-xl border border-white/5 text-white/90 text-sm font-medium">
                              {competitorResult.howToReplicate}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-card h-full flex flex-col items-center justify-center text-center p-12 space-y-4 border-dashed">
                      <div className="bg-white/5 p-6 rounded-full">
                        <Search className="w-12 h-12 text-white/40" />
                      </div>
                      <h3 className="text-xl font-bold text-white/60">Enter a competitor's URL</h3>
                      <p className="text-sm text-white/40 max-w-xs">We'll analyze their video to find the exact techniques they used to go viral.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === "roadmap" && roadmap && (
            <motion.div
              key="roadmap"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto space-y-12"
            >
              <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="space-y-2">
                  <h2 className="font-display text-6xl font-bold tracking-tight">Creator <span className="gradient-text">Roadmap</span></h2>
                  <p className="text-white/70 font-medium">Your 90-day plan to go from zero to viral.</p>
                </div>
                <Button variant="outline" className="glass-button" onClick={() => setStep("welcome")}>
                  Back to Home
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="glass-card p-8 space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold flex items-center gap-3">
                        <Brain className="text-pink-500" /> The Mindset Shift
                      </h3>
                      <p className="text-white/70 leading-relaxed italic border-l-4 border-pink-500 pl-6 py-2 bg-white/5 rounded-r-xl">
                        "{roadmap.mindsetShift}"
                      </p>
                    </div>

                    <div className="space-y-8">
                      <h3 className="text-2xl font-bold">The 3-Phase Plan</h3>
                      <div className="space-y-0">
                        {roadmap.phases.map((phase, i) => (
                          <div key={i} className="roadmap-step">
                            <div className="roadmap-dot">
                              <span className="text-white font-bold text-sm">{i + 1}</span>
                            </div>
                            <div className="space-y-3">
                              <h4 className="text-xl font-bold text-pink-400">{phase.title}</h4>
                              <p className="text-white/80 text-sm leading-relaxed">{phase.description}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                {phase.tasks.map((task, j) => (
                                  <div key={j} className="flex items-center gap-2 text-xs text-white/70 bg-white/5 p-2 rounded-lg border border-white/5">
                                    <CheckCircle2 className="w-3 h-3 text-green-500" /> {task}
                                  </div>
                                ))}
                              </div>
                              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/20 mt-2">
                                <Flag className="w-3 h-3 mr-1.5" /> Milestone: {phase.milestone}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="glass-card p-8 space-y-6 bg-gradient-to-br from-pink-500/10 to-transparent">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <Trophy className="text-yellow-500" /> 30-Day Goal
                    </h3>
                    <p className="text-white/80 font-medium leading-relaxed">
                      {roadmap.first30DaysGoal}
                    </p>
                  </div>

                  <div className="glass-card p-8 space-y-6">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-white/70">Essential Tools</h4>
                    <div className="flex flex-wrap gap-2">
                      {roadmap.essentialTools.map((tool, i) => (
                        <Badge key={i} variant="secondary" className="bg-white/5 text-white/90 border-white/10">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card p-8 space-y-6 border-red-500/20 bg-red-500/5">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Common Pitfalls
                    </h4>
                    <ul className="space-y-3">
                      {roadmap.commonPitfalls.map((pitfall, i) => (
                        <li key={i} className="flex items-start gap-3 text-xs text-white/80 leading-relaxed">
                          <span className="text-red-500 font-bold">•</span> {pitfall}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {step === "videoLab" && (
            <motion.div
              key="videoLab"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto space-y-12"
            >
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => setStep("results")} className="hover:bg-white/5 rounded-full">
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <h2 className="font-display text-5xl font-bold tracking-tight">Video <span className="text-pink-500">Lab</span></h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="glass-card p-10 border-dashed border-2 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="bg-white/5 p-6 rounded-full group-hover:scale-110 transition-transform">
                      <Video className="w-12 h-12 text-pink-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">Upload Your Video</h3>
                      <p className="text-sm text-white/60">MP4, MOV or WEBM. Max 50MB.</p>
                    </div>
                    <input 
                      type="file" 
                      accept="video/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={handleVideoUpload}
                    />
                    {videoFile && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/20">
                        {videoFile.name}
                      </Badge>
                    )}
                  </div>

                  <Button 
                    onClick={handleAnalyzeVideo}
                    disabled={!videoFile || loading}
                    className="w-full bg-white text-black hover:bg-white/90 rounded-2xl h-16 text-lg font-bold shadow-xl group"
                  >
                    {loading ? "Analyzing Visuals..." : "Analyze Video"} 
                    <Sparkles className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </Button>

                  <div className="glass-card p-6 space-y-4">
                    <h4 className="font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400" /> What we analyze
                    </h4>
                    <ul className="space-y-2 text-sm text-white/70">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-pink-500" /> Color Correction & Grading</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-pink-500" /> Pacing & Jump Cuts</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-pink-500" /> Lighting & Framing</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-pink-500" /> On-screen Text & Graphics</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-8">
                  {videoAnalysis ? (
                    <div className="space-y-6">
                      <div className="glass-card p-8 space-y-6">
                        <h3 className="text-2xl font-bold">Visual Feedback</h3>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-white/60">Editing & Pacing</h4>
                            <p className="text-white/90 leading-relaxed">{videoAnalysis.videoAnalysis.pacing}</p>
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-white/60">Color & Lighting</h4>
                            <p className="text-white/90 leading-relaxed">{videoAnalysis.videoAnalysis.visuals}</p>
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-white/60">Technical Fixes</h4>
                            <p className="bg-pink-500/5 p-4 rounded-xl border border-pink-500/10 text-pink-200 italic">
                              {videoAnalysis.improvementSuggestions.technicalSuggestions}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-card h-full flex flex-col items-center justify-center text-center p-12 space-y-4 border-dashed">
                      <div className="bg-white/5 p-6 rounded-full">
                        <Zap className="w-12 h-12 text-white/40" />
                      </div>
                      <h3 className="text-xl font-bold text-white/60">Awaiting Video Analysis</h3>
                      <p className="text-sm text-white/40 max-w-xs">Upload a video to get professional feedback on your production quality.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/10 py-20 mt-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-white/5 p-2 rounded-xl">
              <Instagram className="w-5 h-5 text-pink-500" />
            </div>
            <span className="font-display text-xl font-bold">ViralVision<span className="text-pink-500">.ai</span></span>
          </div>
          <p className="text-white/50 text-sm">© 2024 ViralVision AI. All rights reserved.</p>
          <div className="flex gap-8 text-sm font-medium text-white/60">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
  return (
    <div className="glass-card p-6 space-y-4 hover:bg-white/10 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-white/60">{label}</span>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-4xl font-display font-bold">{value}</p>
    </div>
  );
}

