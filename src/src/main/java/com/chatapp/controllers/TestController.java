package com.chatapp.controllers;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/test")
public class TestController {
    @GetMapping
    public String test(){
        return "test API đã ôn";
    }
}