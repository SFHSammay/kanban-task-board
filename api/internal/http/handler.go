package httpapi

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/sam/kanban-task-board/api/internal/supabase"
)

type Handler struct {
	supabase *supabase.Client
}

func NewHandler(client *supabase.Client) *Handler {
	return &Handler{supabase: client}
}

func (h *Handler) Register(mux *http.ServeMux) {
	mux.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	mux.HandleFunc("/tasks", h.handleTasks)
	mux.HandleFunc("/tasks/", h.handleTaskByID)
}

func (h *Handler) handleTasks(w http.ResponseWriter, r *http.Request) {
	accessToken, err := bearerToken(r)
	if err != nil {
		writeError(w, http.StatusUnauthorized, err.Error())
		return
	}

	switch r.Method {
	case http.MethodGet:
		tasks, err := h.supabase.ListTasks(r.Context(), accessToken)
		if err != nil {
			writeError(w, http.StatusBadGateway, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, tasks)
	case http.MethodPost:
		var payload struct {
			Title       string  `json:"title"`
			Description *string `json:"description"`
			Priority    string  `json:"priority"`
			DueDate     *string `json:"due_date"`
		}
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			writeError(w, http.StatusBadRequest, "invalid JSON body")
			return
		}
		if strings.TrimSpace(payload.Title) == "" {
			writeError(w, http.StatusBadRequest, "title is required")
			return
		}
		if !validPriority(payload.Priority) {
			writeError(w, http.StatusBadRequest, "priority must be low, normal, or high")
			return
		}

		task, err := h.supabase.CreateTask(r.Context(), accessToken, supabase.TaskCreateInput{
			Title:       strings.TrimSpace(payload.Title),
			Description: payload.Description,
			Priority:    payload.Priority,
			DueDate:     payload.DueDate,
		})
		if err != nil {
			writeError(w, http.StatusBadGateway, err.Error())
			return
		}
		writeJSON(w, http.StatusCreated, task)
	default:
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
	}
}

func (h *Handler) handleTaskByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	accessToken, err := bearerToken(r)
	if err != nil {
		writeError(w, http.StatusUnauthorized, err.Error())
		return
	}

	id := strings.TrimPrefix(r.URL.Path, "/tasks/")
	if id == "" {
		writeError(w, http.StatusBadRequest, "task id is required")
		return
	}

	var payload struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}
	if !validStatus(payload.Status) {
		writeError(w, http.StatusBadRequest, "invalid status")
		return
	}

	task, err := h.supabase.UpdateTaskStatus(r.Context(), accessToken, id, payload.Status)
	if err != nil {
		writeError(w, http.StatusBadGateway, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, task)
}

func bearerToken(r *http.Request) (string, error) {
	header := r.Header.Get("Authorization")
	if !strings.HasPrefix(header, "Bearer ") {
		return "", errors.New("missing bearer token")
	}
	return strings.TrimPrefix(header, "Bearer "), nil
}

func validStatus(status string) bool {
	switch status {
	case "todo", "in_progress", "in_review", "done":
		return true
	default:
		return false
	}
}

func validPriority(priority string) bool {
	switch priority {
	case "low", "normal", "high":
		return true
	default:
		return false
	}
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}
