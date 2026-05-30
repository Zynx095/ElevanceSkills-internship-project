import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  Clock,
  Flag,
  History,
  Share,
  Trash,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import axiosInstance from "@/lib/axiosinstance";
import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
const questionData = {
  id: 3,
  title: "How can i block user with middleware?",
  content: `
## The problem

I am trying to create a complete user login form in NextJS and I want to block the user to go to other pages without a login process before. So online i found that one of the most complete solution could be the use of a middleware but i don't know how it doesn't work.

## Middleware code:

\`\`\`javascript
// middleware.ts (position: root)
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  const token = req.cookies.get("authToken")?.value;
  
  if (!token) {
    console.log("[middleware] No token on", pathname, "-> redirect to /");
    return NextResponse.redirect(new URL("/", req.url));
  }
  
  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (err) {
    console.log("[middleware] Invalid token on", pathname, "->", err);
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/add-todo",
    "/add-todo/:path*",
    "/edit-todo",
    "/edit-todo/:path*",
    "/settings",
  ]
}
\`\`\`

What I'm expecting is that when the user tries to access protected routes without being authenticated, they should be redirected to the login page. However, the middleware doesn't seem to be working as expected.

## What I tried:

1. Placed the middleware.ts file in the root directory
2. Configured the matcher to include all protected routes
3. Used JWT verification to check token validity
4. Added proper error handling and logging

The middleware runs but the redirects don't work properly. Sometimes users can still access protected pages even without valid tokens.
  `,
  votes: -4,
  answers: 2,
  views: 38,
  tags: ["node.js", "forms", "authentication", "next.js", "middleware"],
  author: {
    id: 3,
    name: "Aledi5",
    avatar: "A",
  },
  askedDate: "3 days ago",
  modifiedDate: "3 days ago",
  isBookmarked: false,
  userVote: null, // null, 'up', or 'down'
};

// Mock answers data
const answersData = [
  {
    id: 1,
    content: `The issue you're experiencing is likely due to the middleware configuration and how NextJS handles redirects. Here are a few things to check:

## 1. Middleware File Location
Make sure your \`middleware.ts\` file is in the correct location - it should be in the root of your project (same level as \`pages\` or \`app\` directory).

## 2. Import Statements
You're missing some important imports in your middleware:

\`\`\`javascript
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
\`\`\`

## 3. Updated Middleware Code

\`\`\`javascript
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies
  const token = request.cookies.get("authToken")?.value;
  
  if (!token) {
    console.log("[middleware] No token found, redirecting to login");
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    // Verify the JWT token
    const { payload } = await jwtVerify(token, secret);
    console.log("[middleware] Token verified for user:", payload.sub);
    return NextResponse.next();
  } catch (error) {
    console.log("[middleware] Token verification failed:", error);
    // Clear the invalid token
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('authToken');
    return response;
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/add-todo/:path*',
    '/edit-todo/:path*',
    '/settings/:path*'
  ]
}
\`\`\`

## Key Changes:
- Added proper imports
- Redirect to \`/login\` instead of \`/\`
- Clear invalid tokens from cookies
- Simplified matcher patterns
- Better error handling

This should resolve your middleware issues.`,
    votes: 5,
    author: {
      id: 1,
      name: "John Doe",
      reputation: 15420,
      avatar: "JD",
    },
    answeredDate: "2 days ago",
    isAccepted: true,
    userVote: null,
  },
  {
    id: 2,
    content: `Another approach you might consider is using NextAuth.js which handles authentication middleware automatically:

## Installation
\`\`\`bash
npm install next-auth
\`\`\`

## Configuration
Create \`pages/api/auth/[...nextauth].js\`:

\`\`\`javascript
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Add your authentication logic here
        const user = await authenticateUser(credentials)
        return user ? user : null
      }
    })
  ],
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      return { ...token, ...user }
    },
    async session({ session, token }) {
      return { ...session, user: token }
    }
  }
})
\`\`\`

## Middleware with NextAuth
\`\`\`javascript
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*']
}
\`\`\`

This approach is more robust and handles many edge cases automatically.`,
    votes: 2,
    author: {
      id: 2,
      name: "Felix Rodriguez",
      reputation: 799,
      avatar: "FR",
    },
    answeredDate: "1 day ago",
    isAccepted: false,
    userVote: null,
  },
];
const QuestionDetail = ({ questionId }: any) => {
  const router = useRouter();
  const [question, setquestion] = useState<any>(null);
  const [answer, setanswer] = useState<any>();
  const [newanswer, setnewAnswer] = useState("");
  const [isSubmitting, setisSubmitting] = useState(false);
  const [loading, setloading] = useState(true);
  const { user } = useAuth();
  useEffect(() => {
    const fetchuser = async () => {
      try {
        const res = await axiosInstance.get("/question/getallquestion");
        const matchedquestion = res.data.data.find(
          (u: any) => u._id === questionId
        );
        setanswer(matchedquestion.answer);
        setquestion(matchedquestion);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    fetchuser();
  }, [questionId]);
  if (loading) {
    return (
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
    );
  }
  if (!question) {
    return (
      <div className="text-center text-gray-500 mt-4">No question found.</div>
    );
  }

  const handleVote = async (vote: String) => {
    if(!user){
      toast.info("Please login to continue")
      router.push("/auth")
      return
    }
    try {
      const res = await axiosInstance.patch(`/question/vote/${question._id}`, {
        value: vote,
        userid: user?._id,
      });
      if (res.data.data) {
        setquestion(res.data.data);
        toast.success("Vote Updated");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to Vote question");
    }
  };
  const handlebookmark = () => {
    setquestion((prev: any) => ({ ...prev, isBookmarked: !prev.isBookmarked }));
  };
  const handleSubmitanswer = async () => {
    if(!user){
      toast.info("Please login to continue")
      router.push("/auth")
      return
    }
    if (!newanswer.trim()) return;
    setisSubmitting(true);
    try {
      const res = await axiosInstance.post(
        `/answer/postanswer/${question?._id}`,
        {
          noofanswer: question.noofanswer,
          answerbody: newanswer,
          useranswered: user.name,
          userid: user._id,
        }
      );
      if (res.data.data) {
        const newObj = {
          answerbody: newanswer,
          useranswered: user.name,
          userid: user._id,
          answeredon: new Date().toISOString(),
        };
        setquestion((prev: any) => ({
          ...prev,
          noofanswer: prev.noofanswer + 1,
          answer: [...(prev.answer || []), newObj],
        }));
        toast.success("Answer Uploaded");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to Answer");
    } finally {
      setnewAnswer("");
      setisSubmitting(false);
    }
  };
  const handleDelete = async () => {
    if(!user){
      toast.info("Please login to continue")
      router.push("/auth")
      return
    }
    if (!window.confirm("Are you sure you want to delete this question?"))
      return;
    try {
      const res = await axiosInstance.delete(
        `/question/delete/${question._id}`
      );
      if (res.data.message) {
        toast.success(res.data.message);
        router.push("/");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete question");
    }
  };
  const handleDeleteanswer = async (id: String) => {
    if(!user){
      toast.info("Please login to continue")
      router.push("/auth")
      return
    }
    if (!window.confirm("Are you sure you want to delete this answer?"))
      return;
    try {
      const res = await axiosInstance.delete(`/answer/delete/${question._id}`, {
        data: {
          noofanswer: question.noofanswer,
          answerid: id,
        },
      });
      if (res.data.data) {
        const updateanswer = question.answer.filter(
          (ans: any) => ans._id !== id
        );
        setquestion((prev: any) => ({
          ...prev,
          noofanswer: updateanswer.length,
          answer: updateanswer,
        }));
        toast.success("deleted successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete question");
    }
  };

  return (
    <div className="max-w-5xl">
      {/* Question Header */}
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-semibold mb-4 text-gray-900">
          {question.questiontitle}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Asked {new Date(question.askedon).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <Card className="mb-8">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Voting Section */}
            <div className="flex sm:flex-col items-center sm:items-center p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                className={`p-2 ${"text-gray-600 hover:text-orange-500"}`}
                onClick={() => handleVote("upvote")}
              >
                <ChevronUp className="w-6 h-6" />
              </Button>
              <span>{question.upvote.length - question.downvote.length}</span>
              <Button
                variant="ghost"
                size="sm"
                className={`p-2 ${"text-gray-600 hover:text-orange-500"}`}
                onClick={() => handleVote("downvote")}
              >
                <ChevronDown className="w-6 h-6" />
              </Button>
              <div className="flex sm:flex-col gap-2 sm:gap-4 mt-4 sm:mt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`p-2 ${
                    question?.isBookmarked
                      ? "text-yellow-500"
                      : "text-gray-600 hover:text-yellow-500"
                  }`}
                  onClick={handlebookmark}
                >
                  <Bookmark
                    className="w-5 h-5"
                    fill={question?.isBookmarked ? "currentColor" : "none"}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 text-gray-600 hover:text-gray-800"
                >
                  <History className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="flex-1 p-4 sm:p-6">
              <div className="prose max-w-none mb-6">
                <div
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: question.questionbody
                      .replace(
                        /## (.*)/g,
                        '<h3 class="text-lg font-semibold mt-6 mb-3 text-gray-900">$1</h3>'
                      )
                      .replace(
                        /```(\w+)?\n([\s\S]*?)```/g,
                        '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm">$2</code></pre>'
                      )
                      .replace(
                        /`([^`]+)`/g,
                        '<code class="bg-gray-100 px-2 py-1 rounded text-sm">$1</code>'
                      )
                      .replace(/\n\n/g, '</p><p class="mb-4">')
                      .replace(/^/, '<p class="mb-4">')
                      .replace(/$/, "</p>")
                      .replace(
                        /\n(\d+\. .*)/g,
                        '<ol class="list-decimal list-inside my-4"><li>$1</li></ol>'
                      ),
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {question.questiontags.map((tag: any) => (
                  <Link key={tag} href={`/tags/${tag}`}>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                    >
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <Share className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <Flag className="w-4 h-4 mr-1" />
                    Flag
                  </Button>
                  {question.userid === user?._id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">
                    asked {new Date(question.askedon).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/users/${question.userid}`}
                    className="flex items-center gap-2 hover:bg-blue-50 p-2 rounded"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-sm">
                        {question.userposted[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-blue-600 hover:text-blue-800 font-medium">
                        {question.userposted}
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-900">
          {question.answer.length} Answer
          {question.answer.length !== 1 ? "s" : ""}
        </h2>
        <div className="space-y-6">
          {question.answer.map((ans: any) => (
            <Card key={ans._id} className={""}>
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  {/* Answer Content */}
                  <div className="flex-1 p-4 sm:p-6">
                    <div className="prose max-w-none mb-6">
                      <div
                        className="text-gray-800 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: ans.answerbody
                            .replace(
                              /## (.*)/g,
                              '<h3 class="text-lg font-semibold mt-6 mb-3 text-gray-900">$1</h3>'
                            )
                            .replace(
                              /```(\w+)?\n([\s\S]*?)```/g,
                              '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm">$2</code></pre>'
                            )
                            .replace(
                              /`([^`]+)`/g,
                              '<code class="bg-gray-100 px-2 py-1 rounded text-sm">$1</code>'
                            )
                            .replace(/\n\n/g, '</p><p class="mb-4">')
                            .replace(/^/, '<p class="mb-4">')
                            .replace(/$/, "</p>")
                            .replace(
                              /\n(\d+\. .*)/g,
                              '<ol class="list-decimal list-inside my-4"><li>$1</li></ol>'
                            ),
                        }}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <Share className="w-4 h-4 mr-1" />
                          Share
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <Flag className="w-4 h-4 mr-1" />
                          Flag
                        </Button>
                        {ans.userid === user?._id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteanswer(ans._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">
                          answerd {ans.answeredon}
                        </span>
                        <Link
                          href={`/users/${ans.userid}`}
                          className="flex items-center gap-2 hover:bg-blue-50 p-2 rounded"
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-sm">
                              {ans.useranswered[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-blue-600 hover:text-blue-800 font-medium">
                              {ans.useranswered}
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Your Answer
          </h3>
          <Textarea
            placeholder="Write your answer here... You can use Markdown formatting."
            value={newanswer}
            onChange={(e) => setnewAnswer(e.target.value)}
            className="min-h-32 mb-4 resize-none"
          />
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Button
              onClick={handleSubmitanswer}
              disabled={!newanswer.trim() || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? "Posting..." : "Post Your Answer"}
            </Button>
            <p className="text-sm text-gray-600">
              By posting your answer, you agree to the{" "}
              <Link href="#" className="text-blue-600 hover:underline">
                privacy policy
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-blue-600 hover:underline">
                terms of service
              </Link>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionDetail;
