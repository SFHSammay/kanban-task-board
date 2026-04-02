package supabase

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type Client struct {
	baseURL string
	publishableKey string
	http    *http.Client
}

type Task struct {
	ID          string  `json:"id"`
	Title       string  `json:"title"`
	Description *string `json:"description"`
	Status      string  `json:"status"`
	Priority    string  `json:"priority"`
	DueDate     *string `json:"due_date"`
	CreatedAt   string  `json:"created_at"`
}

type TaskCreateInput struct {
	Title       string  `json:"title"`
	Description *string `json:"description,omitempty"`
	Priority    string  `json:"priority"`
	DueDate     *string `json:"due_date,omitempty"`
}

func NewClient(baseURL, publishableKey string) *Client {
	return &Client{
		baseURL:        strings.TrimRight(baseURL, "/"),
		publishableKey: publishableKey,
		http: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

func (c *Client) ListTasks(ctx context.Context, accessToken string) ([]Task, error) {
	endpoint := fmt.Sprintf("%s/rest/v1/tasks?select=*&order=created_at.desc", c.baseURL)
	var tasks []Task
	if err := c.do(ctx, accessToken, http.MethodGet, endpoint, nil, &tasks); err != nil {
		return nil, err
	}
	return tasks, nil
}

func (c *Client) CreateTask(ctx context.Context, accessToken string, input TaskCreateInput) (Task, error) {
	endpoint := fmt.Sprintf("%s/rest/v1/tasks", c.baseURL)
	body := map[string]any{
		"title":    input.Title,
		"status":   "todo",
		"priority": input.Priority,
	}
	if input.Description != nil && *input.Description != "" {
		body["description"] = input.Description
	}
	if input.DueDate != nil && *input.DueDate != "" {
		body["due_date"] = input.DueDate
	}

	headers := map[string]string{
		"Prefer": "return=representation",
	}

	var tasks []Task
	if err := c.doWithHeaders(ctx, accessToken, http.MethodPost, endpoint, body, headers, &tasks); err != nil {
		return Task{}, err
	}
	if len(tasks) == 0 {
		return Task{}, fmt.Errorf("supabase returned no created task")
	}
	return tasks[0], nil
}

func (c *Client) UpdateTaskStatus(ctx context.Context, accessToken, id, status string) (Task, error) {
	endpoint := fmt.Sprintf("%s/rest/v1/tasks?id=eq.%s", c.baseURL, url.QueryEscape(id))
	headers := map[string]string{
		"Prefer": "return=representation",
	}

	var tasks []Task
	if err := c.doWithHeaders(ctx, accessToken, http.MethodPatch, endpoint, map[string]string{"status": status}, headers, &tasks); err != nil {
		return Task{}, err
	}
	if len(tasks) == 0 {
		return Task{}, fmt.Errorf("task not found or not accessible")
	}
	return tasks[0], nil
}

func (c *Client) do(ctx context.Context, accessToken, method, endpoint string, payload any, out any) error {
	return c.doWithHeaders(ctx, accessToken, method, endpoint, payload, nil, out)
}

func (c *Client) doWithHeaders(ctx context.Context, accessToken, method, endpoint string, payload any, extraHeaders map[string]string, out any) error {
	var body io.Reader
	if payload != nil {
		encoded, err := json.Marshal(payload)
		if err != nil {
			return fmt.Errorf("marshal request: %w", err)
		}
		body = bytes.NewReader(encoded)
	}

	request, err := http.NewRequestWithContext(ctx, method, endpoint, body)
	if err != nil {
		return fmt.Errorf("create request: %w", err)
	}

	request.Header.Set("apikey", c.publishableKey)
	request.Header.Set("Authorization", "Bearer "+accessToken)
	request.Header.Set("Content-Type", "application/json")
	for key, value := range extraHeaders {
		request.Header.Set(key, value)
	}

	response, err := c.http.Do(request)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}
	defer response.Body.Close()

	responseBody, err := io.ReadAll(response.Body)
	if err != nil {
		return fmt.Errorf("read response: %w", err)
	}

	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return fmt.Errorf("supabase error: status=%d body=%s", response.StatusCode, strings.TrimSpace(string(responseBody)))
	}

	if out == nil || len(responseBody) == 0 {
		return nil
	}

	if err := json.Unmarshal(responseBody, out); err != nil {
		return fmt.Errorf("decode response: %w", err)
	}
	return nil
}
