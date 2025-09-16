import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";

import { useState, useContext } from "react";
import './Draft_2.css'
import flag from './images/flag2.jpg'
import logo from './images/iit_logo.png'
import emblem from './images/emblem-dark.png'
import g20 from './images/g20-logo.png'
import year75 from './images/75_years.png'
import side_image from "./images/side_img.jpg"
import ai_graphic from "./images/ai-graphic.svg"
import httpService from "@/services/httpService";
import axios from "axios";
import { login, setUser } from "@/context/UserContext";
import { ToastContainer, toast } from "react-toastify";

export function SignIn() {

  const navigate = useNavigate()

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    login(email, password)
      .catch(() => toast("Invalid credentials!", {
        type: "error"
      }))
  };


  return (
    <>
      <div className="w-[100vw] min-h-[100vh] h-[100vh] p-5 md:p-[5rem] bg-sign-in">
        <div className="w-full h-full">
          <div className="flex justify-between bg-flag rounded-t-lg p-3 bg-contain items-center sm:h-[20%]">
            <img src={emblem} alt="darpg" className="w-[150px] w-[200px] md:w-[350px]" />

            <div className="lg:text-3xl xl:text-4xl font-bold text-[#000839] hidden md:block">
              Intelligent Grievance Management System
            </div>

            <img src={logo} alt="iitk" className="rounded-full w-[60px] md:w-[100px]" />
          </div>

          <div className="w-full flex gap-5 flex-col md:flex-row -mb-10 sm:h-[80%]">
            <div className="w-1/2 p-5 flex flex-col justify-center md:rounded-b-lg hidden md:flex bg-pmopg bg-cover">
              <div className="flex justify-center gap-5 mt-20">
                {/* <img src={side_image} alt="Side Image" className="hidden xl:block xl:w-2/5" /> */}

                {/* <div className="xl:w-3/5 font-bold text-4xl lg:text-4xl text-[#000839] px-10 lg:px-12 xl:px-0 py-4">
                  Intelligent Grievance Management System
                </div> */}
                <svg viewBox="0 0 200 15" className="svg-animation lg:max-w-[25rem] h-[5rem] mt-10">
                  <text x="0" y="0" dy=".35em" textAnchor="middle">
                    <tspan x="50%" dy="0.35em">DRIVEN BY</tspan>
                    <tspan x="50%" dy="1.2em">AI & MACHINE LEARNING</tspan>
                  </text>
                </svg>
              </div>
              {/* <div className="flex justify-between flex-col lg:flex-row">

                <div className="flex bg-white p-2 rounded-md justify-center mt-2">
                  <img src={year75} alt="75 Years" width="120px" className="" />

                  <img src={g20} alt="G20" width="80px" className="" />
                </div>
              </div> */}
            </div>

            <div className="w-full md:w-1/2 flex flex-col justify-center md:bg-white-transparent rounded-b-lg md:my-0">
              <Card className="py-10 px-1 md:shadow-none rounded-t-none bg-white-transparent h-full">
                <CardHeader
                  variant="gradient"
                  // color="blue"
                  className="mb-4 mt-1 md:mt-2 shadow-none rounded-none bg-transparent"
                >
                  <div className="font-bold text-3xl text-[#003A7F] text-center md:hidden">
                    IGMS
                  </div>
                </CardHeader>
                <form onSubmit={handleSubmit}>

                  <CardBody className="flex flex-col gap-4 mt-6 max-w-[25rem] mx-auto">
                    <div className="font-bold text-xl text-white mb-2 ml-1">
                      LOGIN
                    </div>

                    <Input
                      type="text"
                      label={<div className="input-placeholder">Username</div>}
                      size="lg"
                      value={email}
                      className="bg-white-input basic-input"
                      onChange={(e) => setEmail(e.target.value.toLowerCase())}
                      autoFocus
                    />

                    <Input
                      type="password"
                      label={<div className="input-placeholder">Password</div>}
                      size="lg"
                      value={password}
                      className="bg-white-input basic-input"
                      onChange={(e) => setPassword(e.target.value)}
                    />

                    {/* <div className="d-flex align-items-center mt-2"><input name="" type="checkbox" value="" /> <span
                      className="pl-2 font-weight-bold text-white">Remember Me</span></div> */}

                  </CardBody>
                  <CardFooter className="pt-0 flex flex-col items-center overflow-hidden">
                    <Button variant="gradient" type="submit" className="text-md text-indigo-900">
                      Signin
                    </Button>

                    <Typography variant="small" className="mt-6 flex justify-center self-center text-black text-white">
                      Don't have credentials, contact to admin.
                    </Typography>

                    <div className="flex justify-between w-full -mb-105 mt-4 flex-col sm:flex-row items-center md:hidden">
                      <svg viewBox="0 0 200 15" className="svg-animation max-w-[15rem] h-[5rem] text-black">
                        <text x="0" y="0" dy=".35em" textAnchor="middle">
                          <tspan x="50%" dy="0.35em">DRIVEN BY</tspan>
                          <tspan x="50%" dy="1.2em">AI & MACHINE LEARNING</tspan>
                        </text>
                      </svg>

                      <div className="flex bg-white p-2 rounded-md justify-center mt-2">
                        <img src={year75} alt="75 Years" width="80px" className="" />

                        <img src={g20} alt="G20" width="60px" className="" />
                      </div>
                    </div>
                  </CardFooter>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default SignIn;
