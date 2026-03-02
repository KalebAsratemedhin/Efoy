import { useForm } from "react-hook-form"
import { useCreateCommentMutation, useFindAllCommentsQuery } from "../../redux/api/commentAPI";
import Spinner from "../utils/Spinner";
import Error from "../utils/Error";
import { useEffect } from "react";

interface FormData{
    content: string;
}

const CommentBox = ({doctorId}: {doctorId: string}) => { 
    const {formState:{errors}, register, handleSubmit } = useForm<FormData>()
    const [commentDoc, {isLoading, isSuccess, isError, error}] = useCreateCommentMutation()
    const {refetch} = useFindAllCommentsQuery(doctorId)


    const onSubmit = async (data: FormData) => {
        const commentData = {
            ...data,
            doctorId
        }
        const result = await commentDoc(commentData)

        console.log('comment', result)


    }

    useEffect(() => {
        if(isSuccess)
            refetch()
    }, [isSuccess, refetch])

    if (isLoading ) return <Spinner />;
    if (isError ) return <Error error={error} />;

    

    // if (isSuccess)
        

    return (
        <div className="h-full">
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
                <div className="my-3">
                    <label className="text-gray-500 text-base" htmlFor="content">Content</label>
                        <textarea className="block border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg h-12 px-2 w-full border" id="content"    {...register('content', {
                            required: "Content is required"
                        })} />
                    
                    <p className="text-red-500 text-base mt-1">{errors.content?.message}</p>
                </div>
            <button type="submit" className="w-full  bg-purple-700 text-lg font-semibold hover:shadow-md text-white py-2 rounded-full">Save</button> 

            </form>
        </div>
    )
}

export default CommentBox