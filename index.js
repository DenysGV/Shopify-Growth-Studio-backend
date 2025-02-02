import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv';
import mongoose from 'mongoose'
import User from './models/user.model.js'
import Article from './models/article.model.js';
import fs from 'fs';
import * as cheerio from 'cheerio';

dotenv.config();

mongoose.connect(process.env.CONNECTING_STRING)

const app = express()

app.use(express.json())
app.use(cors({ origin: '*' }));

app.post('/create-account', async (req, res) => {
   const { fullName, email, password, phone, tgUserName } = req.body

   if (!fullName) {
      return res.status(400).json({ error: true, message: 'Full Name is required' })
   }
   if (!email) {
      return res.status(400).json({ error: true, message: 'Email is required' })
   }
   if (!password) {
      return res.status(400).json({ error: true, message: 'Password is required' })
   }
   if (!phone) {
      return res.status(400).json({ error: true, message: 'Phone is required' })
   }
   if (!tgUserName) {
      return res.status(400).json({ error: true, message: 'Telergam user name is required' })
   }

   const isUser = await User.findOne({ email: email })

   if (isUser) {
      return res.json({
         error: true,
         message: 'User already exist'
      })
   }

   const user = new User({
      fullName,
      email,
      password,
      phone,
      tgUserName
   })

   await user.save()

   return res.json({
      error: false,
      user,
      message: 'Registration Successfuly',
   })
})

app.post('/login', async (req, res) => {
   const { email, password } = req.body

   if (!email) {
      return res.status(400).json({ error: true, message: "Необхідно вказати адресу електронної пошти" })
   }
   if (!password) {
      return res.status(400).json({ error: true, message: "Необхідно ввести пароль" })
   }

   const userInfo = await User.findOne({ email: email });

   if (!userInfo) {
      return res.status(400).json({ error: true, message: "Користувача не знайдено" })
   }

   if (userInfo.password === password) {
      return res.status(200).json({
         error: false,
         userInfo,
         message: 'Вхід здійснено успішно'
      })
   } else {
      return res.status(400).json({
         error: true,
         message: 'Неправильний пароль'
      })
   }
})

app.post('/send-message', async (req, res) => {
   const { name, phone, email, tgName } = req.body;

   let message = `
      Новое сообщение от Shopify Growth Studio
      Имя: ${name}
      Телефон: ${phone}
      Емейл: ${email}
      Тг: ${tgName}
   `

   // Формирование URL для API Telegram
   const url = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`;

   // Отправка POST запроса в Telegram API
   const response = await fetch(url, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify({
         chat_id: process.env.TELEGRAM_CHAT_ID,
         text: message,
      }),
   });

   const result = await response.json();

   if (result.ok) {
      res.json({ error: false, message: "Сообщение успешно отправленно, мы как можно быстрее свяжемся с вами" })
   } else {
      res.json({ error: true, message: "Что-то пошло не так" })
   }
});

app.post("/user-time", async (req, res) => {
   const { userId, timeSpent } = req.body;

   try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: true, message: "Пользователь не найден" });

      user.totalTimeSpent += timeSpent; // Прибавляем время к общему счетчику
      await user.save();

      res.json({
         error: false,
         user,
         message: 'Время успешно обновленно'
      })
   } catch (error) {
      res.status(500).json({ error: true, message: "Ошибка сервера" })
   }
});

app.get("/all-lessons", async (req, res) => {
   try {
      const lessons = await Article.find()
      res.status(200).json(lessons)
   } catch (error) {
      res.status(400)
   }
})

app.get("/lesson/:id", async (req, res) => {
   try {
      const { id } = req.params
      const lesson = await Article.findOne({ id: id })

      res.status(200).json(lesson)
   } catch (error) {
      res.status(400)
   }
})

app.post("/toggle-completed", async (req, res) => {
   const { userId, lesson } = req.body

   try {
      const user = await User.findById(userId);
      if (!user) return res.status(404);

      if (user.lecturesCompleted.lessons.find(item => item.lectureId == lesson.lectureId)) {

         user.lecturesCompleted.lessons = user.lecturesCompleted.lessons.filter(item => item.lectureId != lesson.lectureId)

         await user.save();
         return res.status(200).json(user.lecturesCompleted.lessons)
      }

      user.lecturesCompleted.lessons = [...user.lecturesCompleted.lessons, lesson]

      await user.save();
      return res.status(200).json(user.lecturesCompleted.lessons)

   } catch (error) {
      return res.status(400)
   }
})

app.listen(8000)