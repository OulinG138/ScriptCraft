import React, { useEffect, useState} from "react";
import { Editor} from '@monaco-editor/react';
import useAuth from "@/hooks/useAuth";
import API from "@/routes/API";
import toast from "react-hot-toast";
import _ from "lodash";
import { useRouter } from 'next/router';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

import{
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

const languages = [
    "python",
    "javascript",
    "java",
    "c",
    "cpp",
    "shell",
    "rust",
    "lua",
    "ruby",
    "r"
]

export default function Coding() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSaving, setIsSaving] = useState(false)
  const [isOwner, setIsOwner] = useState(true)

  const [parentId, setParentId] = useState("")
  const [author, setAuthor] = useState("")
  const [created, setCreated] = useState("")
  const [updated, setUpdated] = useState("")

  const [savingMessage, setMessage] = useState("")

  const [detailToggle, setDetail] = useState(true)
  const [inputToggle, setInputting] = useState(true)
  const [dialogueToggle, setDialogue] = useState(false)
  const [dialogErrorToggle, setDialogueError] = useState(false)

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [stdout, setStdout] = useState("");

  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [id, setId] = useState(-1);

  const [tags, setTags] = useState<string[]>([])
  const [tempTags, setTempTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  const { auth } = useAuth();
  const router = useRouter();

  const execute = async () =>    {
    const reqBody = {content: code, language: language, input: input}
    setIsExecuting(true)
    let res = await API.code.execute(reqBody)
    var out = null
    out = res.data.stdout
    
    setStdout(out.replace(
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, ''))
    if (res.status === 201) {
      toast.error("Execution Successful but Timed Out")
    }
    setIsExecuting(false)
  }

  const triggerSave = async (event: React.FormEvent<HTMLFormElement>) =>   {
      event.preventDefault();
      const data = new FormData(event.currentTarget);

      if (!data.get("title") || !data.get("desc"))  {
        setDialogueError(true)
        return;
      }
      setDialogueError(false)
      setIsSaving(true);
      setMessage("Saving Changes...")

      const reqBody = { title: data.get("title"), explanation: data.get("desc"), codeContent: code, language: language, tags: tempTags};
      const res = await API.code.editTemplate(id, reqBody,  _.get(auth, "accessToken", ""))

      if (res.status === 200) {
        toast.success("Changes Successfully Saved")
        const encryptedId = router.query.id
        const id = window.atob((typeof(encryptedId) === "string") ? encryptedId : "")


        fillTemplate(parseInt(id))
      } else  {
        toast.error(res.data.message)
      }
      toggleDialogue()
      setIsSaving(false);
  }

  const forkTemplate = async () =>  {
    setIsSaving(true);
    setMessage("Forking Template...")
    const res = await API.code.forkTemplate(id, _.get(auth, "accessToken", ""))
    if (res.status === 200) {
      toast.success("Fork Successful!")
      const encryptedId = window.btoa(res.data.template.id)
      router.push("/code-template?id=" + encryptedId)
    } else if (res.status === 201)  {
      toast.success("Fork Successful!")
      const encryptedId = window.btoa(res.data.template.id)
      router.push("/coding?id=" + encryptedId)
    } else  {
      toast.error(res.data.message)
    }
    setIsSaving(false);
  }

  const deleteTemplate = async () =>  {
    setIsSaving(true);
    setMessage("Deleting Template...")

    const res = await API.code.deleteTemplate(id, _.get(auth, "accessToken", ""))
    if (res.status === 200) {
      toast.success("Delete Successful!")
      router.push("/coding")
    } else  {
      toast.error(res.data.message)
    }
  }

  const toggleDetail = () =>    {
    setDetail(!detailToggle);
  }

  const toggleInputting = () =>    {
    setInputting(!inputToggle);
  }

  const toggleDialogue = () =>    {
    setTempTags(tags)
    setDialogue(!dialogueToggle);
  }

  const addTag = () =>  {
      var exists = tempTags.indexOf(newTag) > -1
      if (exists) {
        toast.error("Tag Already Added")
      } else  {
        var orig = tempTags;
        var updatedTags = orig.concat([newTag]);
    
        setNewTag("")
        setTempTags(updatedTags);
      }
  }

  const handleKey = (e: { key: string; }) =>  {
    if (e.key === "Enter") {
      addTag()
    }
  }

  const fillTemplate = async (id: number) =>    {
    const template = await API.code.getTemplate(id)
    if (template.status === 200)    {
        const data = template.data.result

        setCode(data.codeContent)
        setTitle(data.title)
        setDesc(data.explanation)

        const newTags: string[] = []

        data.tags.forEach((tag: any) => {
            newTags.push(tag.name)
        });
        setTags(newTags)

        setId(data.id)

        setIsOwner(auth.user?.id === data.authorId)

        setAuthor(("Author #" + data.authorId).slice(0, 12))

        setParentId((data.parentTemplateId === null) ? "" : window.btoa(data.parentTemplateId))

        setCreated(data.createdAt.split("T")[0] + " at " + data.createdAt.split("T")[1].split(".")[0])
        setUpdated(data.updatedAt.split("T")[0] + " at " + data.updatedAt.split("T")[1].split(".")[0])
    }   else    {
        router.push("/coding")
    }
  }

  useEffect(() => {
    if (router.isReady) {
        const encryptedId = router.query.id 
        if (typeof(encryptedId) === "string")    {
            try {
                const id = window.atob(encryptedId)
                fillTemplate(parseInt(id))
            }   catch (error)   {
                router.push("/coding")
            }
        }   else    {
            router.push("/coding")
        }
        
    }
  }, [router]);

  const forkAlert = () =>  {
    confirmAlert({
      message: "Would you like to create a fork of this template?",
      buttons: [
        {
          label: 'Yes',
          onClick: forkTemplate
        },
        {
          label: 'No'
        }
      ]
    })
  }

  const deleteAlert = () =>  {
    confirmAlert({
      message: "Would you like to delete this template?",
      buttons: [
        {
          label: 'Yes',
          onClick: deleteTemplate
        },
        {
          label: 'No'
        }
      ]
    })
  }

  const deleteTag = (tag: string)  =>  {
    var newTags = tempTags.filter((word) => (!(word === tag)));
    setTempTags(newTags);
  }

  return (
    <div className="flex flex-col w-full h-screen bg-gray-50 text-gray-900">

      <div className="custom-ui">
        <Box
          component="form"
          noValidate
          onSubmit={triggerSave}
          className="space-y-4"
          maxWidth="lg"
        >
          <Dialog
            disablePortal
            open={dialogueToggle}
            onClose={toggleDialogue}
            aria-labelledby="customized-dialog-title"
            disableEscapeKeyDown
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle id="customized-dialog-title" onClose={toggleDialogue}>
              Edit Information:
            </DialogTitle>
            <DialogContent dividers>
              <Box mb={2}>
                <TextField
                  required
                  error={dialogErrorToggle}
                  id="outlined-required"
                  helperText={(dialogErrorToggle) ? "Please Fill Field." : ""}
                  name="title"
                  label="Title"
                  variant="filled"
                  fullWidth
                  defaultValue={title}
                />
              </Box>
              <Box mb={2}>
                <TextField
                  required
                  error={dialogErrorToggle}
                  id="standard-multiline-static"
                  helperText={(dialogErrorToggle) ? "Please Fill Field." : ""}
                  label="Description"
                  name="desc"
                  multiline
                  rows={4}
                  fullWidth
                  defaultValue={desc}
                />
              </Box>
              <Box mb={2} display="flex" alignItems="center" gap={2}>
                <TextField
                  id="outlined-controlled"
                  label="New Tag"
                  variant="outlined"
                  size="small"
                  value={newTag}
                  onChange={(e) => {setNewTag(e.target.value)}}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleKey(e);
                    }
                  }}
                  style={{ width: '60%' }}
                />
                <Button
                  variant="contained"
                  onClick={addTag}
                  className="bg-slate-500 disabled:bg-slate-300 text-white px-6 py-2 rounded hover:bg-slate-600 disabled:hover:bg-slate-300 text-sm lg:text-base"
                >
                  Add Tag
                </Button>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap", 
                  gap: 1,          
                }}
              >
                {tempTags.map((tag) => (
                  <Chip
                    key={tag}
                    variant="outlined"
                    label={tag}
                    onDelete={() => deleteTag(tag)}
                  />
                ))}
              </Box>

            </DialogContent>
            <DialogActions>
              <Button autoFocus type="submit" color="primary">
                Finish
              </Button>
              <Button autoFocus onClick={toggleDialogue} color="primary">
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </div>

      <div className="flex items-center p-4 bg-gray-100 border-b border-gray-300 shadow">
        {detailToggle && (
          <div className="flex flex-grow flex-col sm:flex-row sm:items-start md:space-x-4 sm:space-x-8 space-y-4 sm:space-y-0">

            <div className="flex flex-col space-y-4">
              
              <div className="flex flex-row items-center md:space-x-1 sm:space-x-2 space-x-1">
                <h1 className="text-sm lg:text-base font-semibold">Title:</h1>
                <h1 className="text-sm lg:text-base font-semibold max-w-[200px] md:max-w-[150px] break-words">
                  {title}
                </h1>
              </div>

              <div className="flex flex-row items-center md:space-x-1 sm:space-x-2 space-x-1">
                <h1 className="text-sm lg:text-base font-semibold">Author:</h1>
                <h1 className="text-sm lg:text-base font-semibold">{author}</h1>
              </div>

              <div className="flex flex-col space-y-4">
                <div className="flex flex-row items-center md:space-x-1 sm:space-x-2 space-x-1">
                  <h1 className="text-sm lg:text-base font-semibold">Created On:</h1>
                  <h1 className="text-xs lg:text-sm font-semibold">{created}</h1>
                </div>
                <div className="flex flex-row items-center md:space-x-1 sm:space-x-2 space-x-1">
                  <h1 className="text-sm lg:text-base font-semibold">Updated On:</h1>
                  <h1 className="text-xs lg:text-sm font-semibold">{updated}</h1>
                </div>
                {!(parentId === "") && (
                  <div className="flex flex-row items-center md:space-x-1 sm:space-x-2 space-x-1">
                    <h1 className="text-sm lg:text-base font-semibold">Parent Template:</h1>
                    <a className="text-blue-500 hover:text-blue-700 underline text-xs lg:text-sm"
                      href={`/code-template?id=${parentId}`}>Link</a>
                  </div>
                )}
              </div>
            </div>

              <div className="flex flex-col space-y-2">
                <div className="flex flex-row items-center md:space-x-1 sm:space-x-2 space-x-1">
                  <h1 className="text-sm lg:text-base font-semibold">Description:</h1>
                    <h1 className="lg:text-sm text-xs font-semibold max-w-[135px] lg:max-w-[180px] break-words">
                      {desc}
                    </h1>
                  </div>

                  <div className="flex flex-row items-center md:space-x-1 sm:space-x-2 space-x-1">

                    <h1 className="text-sm lg:text-base font-semibold">Tags:</h1>
                    <select
                      className="bg-gray-200 border border-gray-300 rounded px-2 py-1 sm:px-4 sm:py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-[100px] lg:w-[170px]"
                    >
                      {tags.length === 0 && (
                        <option
                          key="No Tags"
                          value="No Tags"
                          className="bg-gray-200 text-gray-800"
                        >
                          No Tags
                        </option>
                      )}
                      {tags.map((tag) => (
                        <option
                          key={tag}
                          value={tag}
                          className="bg-gray-200 text-gray-800"
                        >
                          {tag}
                        </option>
                      ))}
                    </select>
                  </div>
              </div>
          </div>
        )}

        <div
          className={`ml-auto ${
            detailToggle
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-1 md:gap-3"
              : "flex flex-row flex-wrap gap-1"
          }`}
        >
          {isOwner && (
            <button
              onClick={deleteAlert}
              className="bg-red-500 text-white px-2 sm:px-3 py-1 sm:py-2 rounded hover:bg-red-600 text-xs lg:text-sm"
            >
              Delete
            </button>
          )}
          {detailToggle && isOwner && (
            <button
              onClick={toggleDialogue}
              className="bg-orange-500 text-white px-2 sm:px-3 py-1 sm:py-2 rounded hover:bg-orange-600 text-xs lg:text-sm"
            >
              Edit
            </button>
          )}
          <button
            onClick={toggleDetail}
            className="bg-slate-500 text-white px-2 sm:px-3 py-1 sm:py-2 rounded hover:bg-slate-600 text-xs lg:text-sm"
          >
            {detailToggle ? "Hide Details" : "Show Details"}
          </button>
          <button
            onClick={forkAlert}
            className="bg-green-500 text-white px-2 sm:px-3 py-1 sm:py-2 rounded hover:bg-green-600 text-xs lg:text-sm"
          >
            Fork
          </button>
        </div>
      </div>
      
      {isSaving && (
            <div className="flex justify-center items-center p-2 bg-blue-500 space-x-2">
              <h1 className="text-white">{savingMessage}</h1>
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
            </div>
      )}

      <div className="flex flex-col sm:flex-row flex-grow overflow-hidden p-2 sm:p-4 space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="flex flex-col flex-grow bg-white shadow-lg rounded overflow-hidden w-full sm:w-4/5">
          <div className="flex flex-row items-center justify-between bg-gray-100 p-2 sm:p-3 border-b border-gray-300">
            <div className="flex items-center space-x-2">
              <span className="text-sm sm:text-md font-semibold"> 
                {inputToggle ? "Code" : "Input"}
              </span>
              <select
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-200 border border-gray-300 rounded px-2 py-1 sm:px-4 sm:py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-24 sm:w-auto"
              >
                {languages.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </div>

            <div className="ml-auto flex space-x-2">
              <button
                onClick={toggleInputting}
                className="bg-purple-600 text-white px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm rounded hover:bg-purple-700"
              >
                {inputToggle ? "Switch to Input" : "Switch to Code"}
              </button>
              <button
                onClick={execute}
                className="bg-green-500 text-white px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm rounded hover:bg-green-600"
              >
                Execute
              </button>
            </div>
          </div>

          <div className="flex-grow">
            {inputToggle ? (
              <Editor
                options={{readOnly: !isOwner}}
                value={code}
                onChange={(value) => setCode(value || "")}
                className="w-full h-full border-none focus:outline-none"
                language={language}
                theme="vs-dark"
              />
            ) : (
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-full resize-none bg-gray-800 text-gray-200 border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        </div>

        <div className="flex flex-col bg-white shadow-lg rounded overflow-hidden w-full sm:w-1/5 sm:h-auto sm:self-stretch">
          <div className="bg-gray-100 p-2 sm:p-3 border-b border-gray-300">
            <span className="text-sm sm:text-md font-semibold">stdout</span>
          </div>
          {isExecuting && (
            <div className="flex justify-center items-center p-2 bg-green-500 space-x-2">
              <h1 className="text-white">Executing...</h1>
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
          <textarea
            value={stdout}
            readOnly
            className="w-full h-60 sm:h-full resize-none bg-gray-800 text-gray-200 border-none focus:outline-none"
          />
        </div>
      </div>
    </div>
    );
}
