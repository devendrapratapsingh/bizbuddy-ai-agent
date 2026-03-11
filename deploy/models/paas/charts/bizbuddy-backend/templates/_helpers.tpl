{{/*
Expand the name of the chart.
*/}}
{{- define "bizbuddy-backend.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "bizbuddy-backend.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "bizbuddy-backend.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "bizbuddy-backend.labels" -}}
helm.sh/chart: {{ include "bizbuddy-backend.chart" . }}
{{ include "bizbuddy-backend.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "bizbuddy-backend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "bizbuddy-backend.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "bizbuddy-backend.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "bizbuddy-backend.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Return the proper Docker Image Registry Secret Names
*/}}
{{- define "bizbuddy-backend.imagePullSecrets" -}}
{{- with .Values.imagePullSecrets }}
  {{- toYaml . | nindent 8 }}
{{- end }}
{{- end }}

{{/*
Return the database URL from secret
*/}}
{{- define "bizbuddy-backend.databaseUrl" -}}
{{- if .Values.database.existingSecret }}
{{- printf "postgresql://%s:%s@%s:%s/%s?sslmode=disable" .Values.database.username .Values.database.password .Values.database.host .Values.database.port .Values.database.name | b64enc }}
{{- else }}
{{- .Values.config.DATABASE_URL | b64enc }}
{{- end }}
{{- end }}
