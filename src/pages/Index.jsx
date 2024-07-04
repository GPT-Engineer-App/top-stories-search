import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const fetchTopStories = async () => {
  const response = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
  const storyIds = await response.json();
  const stories = await Promise.all(
    storyIds.slice(0, 100).map(async (id) => {
      const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      return storyResponse.json();
    })
  );
  return stories;
};

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: stories, isLoading, error } = useQuery({
    queryKey: ["topStories"],
    queryFn: fetchTopStories,
  });

  const filteredStories = useMemo(() => {
    if (!stories) return [];
    return stories.filter((story) =>
      story.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stories, searchTerm]);

  if (error) return <div>Error loading stories</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Hacker News Top Stories</h1>
      <Input
        type="text"
        placeholder="Search stories..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredStories.length > 0 ? (
            filteredStories.map((story) => (
              <Card key={story.id}>
                <CardHeader>
                  <CardTitle>
                    <a href={story.url} target="_blank" rel="noopener noreferrer">
                      {story.title}
                    </a>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{story.score} upvotes</p>
                </CardContent>
                <CardFooter>
                  <a href={story.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                    Read More
                  </a>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div>No stories found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Index;
