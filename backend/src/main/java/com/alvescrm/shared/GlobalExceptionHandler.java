package com.alvescrm.shared;

import jakarta.validation.ConstraintViolationException;
import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.ErrorResponseException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiError> handleApiException(ApiException exception) {
        return response(exception.getStatus(), exception.getMessage(), Map.of());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException exception) {
        Map<String, String> fields = exception.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        error -> error.getField(),
                        error -> error.getDefaultMessage() == null ? "Valor inválido." : error.getDefaultMessage(),
                        (first, ignored) -> first));
        return response(HttpStatus.BAD_REQUEST, "Revise os campos informados.", fields);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> handleConstraintViolation(ConstraintViolationException exception) {
        return response(HttpStatus.BAD_REQUEST, "Revise os campos informados.", Map.of());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrity(DataIntegrityViolationException exception) {
        logger.warn("Operação rejeitada por conflito de integridade dos dados.", exception);
        return response(HttpStatus.CONFLICT, "A operação conflita com dados já existentes.", Map.of());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadableBody(HttpMessageNotReadableException exception) {
        logger.warn("Requisição recebida com corpo ilegível.", exception);
        return response(HttpStatus.BAD_REQUEST, "O corpo da requisição é inválido.", Map.of());
    }

    @ExceptionHandler(ErrorResponseException.class)
    public ResponseEntity<ApiError> handleFrameworkError(ErrorResponseException exception) {
        HttpStatusCode status = exception.getStatusCode();
        String message = exception.getBody().getDetail();
        return ResponseEntity.status(exception.getStatusCode())
                .body(new ApiError(Instant.now(), status.value(), message, Map.of()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception exception) {
        logger.error("Erro inesperado ao processar a requisição.", exception);
        return response(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Não foi possível concluir a solicitação.",
                Map.of());
    }

    private ResponseEntity<ApiError> response(HttpStatusCode status, String message, Map<String, String> fields) {
        return ResponseEntity.status(status)
                .body(new ApiError(Instant.now(), status.value(), message, fields));
    }
}
