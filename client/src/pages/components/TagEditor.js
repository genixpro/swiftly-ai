import React from 'react';
import Select from 'react-select';
import AsyncCreatable from 'react-select/lib/AsyncCreatable';
import axios from "axios/index";


class TagEditor extends React.Component {
    state = {
        selectedOption: null,
    };

    static getDerivedStateFromProps(props, state)
    {
        if (props.value)
        {
            return {tags: props.value.map((tag) =>
                {
                    return {
                        value: tag,
                        label: tag
                    }
                })
            };
        }
    }

    componentDidMount()
    {
    }

    onCreateTag(data)
    {
        axios.post(`/property_tags`, {name: data}).then((response) =>
        {
            this.setState((state) => {
                state.tags.push({value: data, label: data});
            }, () => this.props.onChange(this.state.tags.map((tag) => tag.label)));
        });
    }

    loadOptions(inputValue, callback)
    {
        axios.get(`/property_tags`, {params: {name: inputValue}}).then((response) =>
        {
            callback(response.data.tags.map((tag) => ({value: tag.name, label: tag.name}) ));
        });
    }


    onChange(newTags)
    {
        if (this.props.onChange)
        {
            this.props.onChange(newTags.map((tag) => tag.label));
            this.setState({tags: newTags});
        }
    }

    render()
    {
        // const { selectedOption } = this.state;

        return (
            <AsyncCreatable
                className={"tag-editor"}
                classNamePrefix={"tag-editor"}
                value={this.state.tags}
                cacheOptions
                isClearable
                isMulti
                loadOptions={this.loadOptions}
                onCreateOption={(data) => this.onCreateTag(data)}
                noOptionsMessage={() => <span>Search for or Type in a Tag</span>}
                defaultOptions
                onChange={(data) => this.onChange(data)}
                onBlur={this.props.onBlur}
            />
        );
    }
}



export default TagEditor;
