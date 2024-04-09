{{ define "job.notification" }}
spec:
  backoffLimit: 1
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: notification
          image: "{{ or .Values.registry .Values.global.registry }}/{{ .Values.global.imageProject }}/{{ .Values.global.imageRepository }}/app:{{ .Values.global.imageTag }}"
          resources:
            requests:
              cpu: 200m
              memory: 2Gi
            limits:
              cpu: 200m
              memory: 2Gi
          {{/* workingDir: /app */}}
          env:
            - name: PRODUCTION
              value: 'true'
            - name: DATABASE_URL
              value: "$(DATABASE_URL)"
          envFrom:
            - configMapRef:
                name: app-configmap
            - secretRef:
                name: pg-app
            - secretRef:
                name: app-sealed-secret
            - secretRef:
                name: carte-jeune-engage-dev-app-access-key
          volumeMounts:
            - name: tz-paris
              mountPath: /etc/localtime
      volumes:
        - name: tz-paris
          hostPath:
            path: /usr/share/zoneinfo/Europe/Paris
{{end}}
